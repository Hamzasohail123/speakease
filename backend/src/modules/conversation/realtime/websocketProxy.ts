import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import OpenAI from 'openai';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';
import { verifyAccessToken } from '../../auth/utils/jwt';
import { buildSystemPrompt, ConversationContext } from '../services/promptService';
import { getUserProfile } from '../../users/services/profileService';
import { getSessionById, getSessionMessages } from '../../sessions/repositories/sessionRepository';
import { getTopicById } from '../../topics/repositories/topicRepository';
import { getUserMemories } from '../../memory/services/memoryService';
import { MessageRole } from '@ai-english-speaker/shared';
import { saveTranscript } from './transcriptService';

/**
 * WebSocket Proxy for OpenAI Realtime API
 * Proxies connections between frontend and OpenAI Realtime API
 */

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  sessionId: string;
  openaiWs: WebSocket | null;
}

const connections = new Map<WebSocket, ClientConnection>();

export function setupRealtimeWebSocket(server: any) {
  const wss = new WebSocketServer({
    server,
    path: '/api/v1/conversation/realtime/ws',
  });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    try {
      // Extract token from query string or headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify token and get user
      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (error) {
        ws.close(1008, 'Invalid token');
        return;
      }

      const userId = decoded.userId;
      const sessionId = url.searchParams.get('sessionId');

      if (!sessionId) {
        ws.close(1008, 'Session ID required');
        return;
      }

      // Verify session
      const session = await getSessionById(sessionId);
      if (!session || session.userId !== userId) {
        ws.close(1008, 'Session not found');
        return;
      }

      // Get context for system prompt
      const userProfile = await getUserProfile(userId);
      let topic = null;
      if (session.topicId) {
        topic = await getTopicById(session.topicId);
      }

      // Get user memories
      const previousMemories = await getUserMemories(userId, 5);

      // Get session history
      const existingMessages = await getSessionMessages(sessionId);
      const sessionHistory = existingMessages.map((msg) => ({
        role: msg.role === MessageRole.USER ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

      const context: ConversationContext = {
        userProfile: userProfile || undefined,
        topic: topic || undefined,
        previousMemories,
        sessionHistory,
      };

      const systemPrompt = buildSystemPrompt(context);

      // Connect to OpenAI Realtime API
      if (!env.OPENAI_API_KEY) {
        logger.error('OPENAI_API_KEY not configured');
        ws.send(JSON.stringify({
          type: 'error',
          error: 'OpenAI API key not configured',
        }));
        ws.close(1008, 'OpenAI API key not configured');
        return;
      }

      // Create Realtime API session
      // Note: OpenAI Realtime API WebSocket endpoint
      const openaiWsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`;
      logger.info(`Connecting to OpenAI Realtime API: ${openaiWsUrl}`);
      
      let openaiWs: WebSocket;
      let connectionTimeout: NodeJS.Timeout;
      
      try {
        openaiWs = new WebSocket(openaiWsUrl, {
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1',
          },
        });

        // Set connection timeout
        connectionTimeout = setTimeout(() => {
          if (openaiWs.readyState !== WebSocket.OPEN) {
            logger.error('OpenAI WebSocket connection timeout');
            openaiWs.close();
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'OpenAI connection timeout - please check your API key and network',
              }));
              ws.close(1011, 'Connection timeout');
            }
          }
        }, 10000); // 10 second timeout
      } catch (error) {
        logger.error('Failed to create OpenAI WebSocket:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Failed to create OpenAI connection',
        }));
        ws.close(1011, 'OpenAI connection failed');
        return;
      }

      // Store connection
      const connection: ClientConnection = {
        ws,
        userId,
        sessionId,
        openaiWs,
      };
      connections.set(ws, connection);

      // Send initial configuration to OpenAI
      openaiWs.on('open', () => {
        clearTimeout(connectionTimeout);
        logger.info('OpenAI WebSocket connected, sending session configuration');
        
        // Notify client that OpenAI connection is ready
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'connection.ready',
            message: 'Connected to OpenAI',
          }));
        }
        
        // Send session configuration (OpenAI Realtime API format)
        const config = {
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            instructions: systemPrompt,
            voice: 'nova',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            temperature: 0.7,
            max_response_output_tokens: 4096,
          },
        };
        
        try {
          openaiWs.send(JSON.stringify(config));
          logger.info('Session configuration sent to OpenAI');
        } catch (error) {
          logger.error('Error sending session config:', error);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Failed to configure OpenAI session',
            }));
          }
        }
      });

      // Forward messages from client to OpenAI
      ws.on('message', (data: Buffer | string) => {
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          try {
            // Handle both JSON and binary (audio) messages
            if (typeof data === 'string') {
              // JSON message - forward as-is
              openaiWs.send(data);
            } else {
              // Binary audio data - forward as-is
              openaiWs.send(data);
            }
          } catch (error) {
            logger.error('Error forwarding message to OpenAI:', error);
          }
        }
      });

      // Forward messages from OpenAI to client
      openaiWs.on('message', (data: Buffer | string) => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            // Handle both JSON and binary (audio) messages
            if (typeof data === 'string') {
              // JSON message - parse and forward
              const message = JSON.parse(data);
              logger.debug('OpenAI message:', message.type);
              
              // Save transcripts
              if (message.type === 'input_audio_buffer.committed' && message.input_audio_buffer?.transcript) {
                // User speech transcribed
                saveTranscript(sessionId, 'user', message.input_audio_buffer.transcript);
              } else if (message.type === 'response.audio_transcript.done' && message.response?.audio_transcript) {
                // AI response transcribed
                saveTranscript(sessionId, 'assistant', message.response.audio_transcript);
              }
              
              ws.send(data);
            } else {
              // Binary audio data - forward as-is
              ws.send(data);
            }
          } catch (error) {
            // If not JSON, forward as binary
            ws.send(data);
          }
        }
      });

      // Handle OpenAI connection errors
      openaiWs.on('error', (error) => {
        logger.error('OpenAI WebSocket error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            error: `OpenAI connection error: ${error.message || 'Unknown error'}`,
          }));
          ws.close(1011, 'OpenAI connection failed');
        }
      });

      // Handle OpenAI connection close
      openaiWs.on('close', (code, reason) => {
        logger.warn(`OpenAI WebSocket closed: ${code} - ${reason}`);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            error: `OpenAI connection closed: ${reason || 'Unknown reason'}`,
          }));
          ws.close(1011, 'OpenAI connection closed');
        }
      });

      ws.on('error', (error) => {
        logger.error('Client WebSocket error:', error);
      });

      // Handle client close
      ws.on('close', (code, reason) => {
        logger.info(`Client WebSocket closed: ${code} - ${reason}`);
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.close();
        }
        connections.delete(ws);
      });

      // Cleanup OpenAI connection
      const cleanupOpenAI = () => {
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.close();
        }
      };

      // Don't call cleanupOpenAI on openaiWs close - already handled above

      logger.info(`Realtime WebSocket connected: userId=${userId}, sessionId=${sessionId}`);
    } catch (error) {
      logger.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  });

  logger.info('Realtime WebSocket server ready on /api/v1/conversation/realtime/ws');
}

