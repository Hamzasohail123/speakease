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
  audioChunksSent?: number; // Track audio chunks for debugging
}

const connections = new Map<WebSocket, ClientConnection>();

export function setupRealtimeWebSocket(server: any) {
  const wss = new WebSocketServer({
    server,
    path: '/api/v1/conversation/realtime/ws',
  });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    // Use console.log to ensure we see this even if logger has issues
    console.log('[REALTIME] ========== NEW CLIENT CONNECTION ==========');
    logger.info('[REALTIME] New client WebSocket connection received');
    try {
      // Extract token from query string or headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

      logger.info('[REALTIME] Extracted token:', token ? 'present' : 'missing');

      if (!token) {
        logger.warn('[REALTIME] No token provided, closing connection');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify token and get user
      let decoded;
      try {
        decoded = verifyAccessToken(token);
        logger.info('[REALTIME] Token verified, userId:', decoded.userId);
      } catch (error) {
        logger.error('[REALTIME] Token verification failed:', error);
        ws.close(1008, 'Invalid token');
        return;
      }

      const userId = decoded.userId;
      const sessionId = url.searchParams.get('sessionId');

      logger.info('[REALTIME] Session ID:', sessionId);

      if (!sessionId) {
        logger.warn('[REALTIME] No session ID provided, closing connection');
        ws.close(1008, 'Session ID required');
        return;
      }

      // Verify session
      logger.info('[REALTIME] Verifying session...');
      const session = await getSessionById(sessionId);
      if (!session || session.userId !== userId) {
        logger.warn('[REALTIME] Session verification failed');
        ws.close(1008, 'Session not found');
        return;
      }
      logger.info('[REALTIME] Session verified successfully');

      // Get context for system prompt
      const userProfile = await getUserProfile(userId);
      let topic = null;
      if (session.topicId) {
        topic = await getTopicById(session.topicId);
      }

      // Get user memories
      const previousMemories = await getUserMemories(userId);

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
      logger.info('[REALTIME] System prompt built, length:', systemPrompt.length);

      // Connect to OpenAI Realtime API
      if (!env.OPENAI_API_KEY) {
        logger.error('[REALTIME] OPENAI_API_KEY not configured');
        ws.send(JSON.stringify({
          type: 'error',
          error: 'OpenAI API key not configured',
        }));
        ws.close(1008, 'OpenAI API key not configured');
        return;
      }

      logger.info(`[REALTIME] API Key present: ${!!env.OPENAI_API_KEY}, length: ${env.OPENAI_API_KEY?.length || 0}`);

      // Create Realtime API session
      // Note: OpenAI Realtime API WebSocket endpoint
      const openaiWsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`;
      logger.info(`[REALTIME] Connecting to OpenAI Realtime API: ${openaiWsUrl}`);
      
      let openaiWs: WebSocket;
      let connectionTimeout: NodeJS.Timeout;
      
      try {
        // CRITICAL: Log BEFORE creating WebSocket to ensure we see it
        console.log(`[REALTIME] Creating WebSocket connection...`);
        logger.info(`[REALTIME] Creating WebSocket connection...`);
        console.log(`[REALTIME] URL: ${openaiWsUrl}`);
        logger.info(`[REALTIME] URL: ${openaiWsUrl}`);
        console.log(`[REALTIME] Headers: Authorization=Bearer ***, OpenAI-Beta=realtime=v1`);
        logger.info(`[REALTIME] Headers: Authorization=Bearer ***, OpenAI-Beta=realtime=v1`);
        
        // Create WebSocket with proper options
        console.log(`[REALTIME] About to create WebSocket object...`);
        openaiWs = new WebSocket(openaiWsUrl, {
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1',
            'User-Agent': 'AI-English-Speaker/1.0',
          },
          // Add perMessageDeflate for better compatibility
          perMessageDeflate: false,
        });

        console.log(`[REALTIME] WebSocket object created, initial state: ${openaiWs.readyState}`);
        logger.info(`[REALTIME] WebSocket object created, initial state: ${openaiWs.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
        
        // Check state immediately
        if (openaiWs.readyState === WebSocket.CLOSED) {
          console.error(`[REALTIME] ⚠️ WebSocket is already CLOSED immediately after creation!`);
          logger.error(`[REALTIME] ⚠️ WebSocket is already CLOSED immediately after creation!`);
        }
        
        // Monitor readyState changes (for debugging)
        const stateCheckInterval = setInterval(() => {
          const state = openaiWs.readyState;
          console.log(`[REALTIME] State check: ${state}`);
          logger.info(`[REALTIME] WebSocket readyState: ${state}`);
          if (state === WebSocket.CLOSED || state === WebSocket.OPEN) {
            clearInterval(stateCheckInterval);
          }
        }, 100); // Check every 100ms
        
        // Clear interval after 5 seconds
        setTimeout(() => clearInterval(stateCheckInterval), 5000);

        // Set connection timeout
        connectionTimeout = setTimeout(() => {
          if (openaiWs.readyState !== WebSocket.OPEN) {
            logger.error(`[REALTIME] Connection timeout - state: ${openaiWs.readyState}`);
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
        logger.error('[REALTIME] Failed to create OpenAI WebSocket:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Failed to create OpenAI connection',
        }));
        ws.close(1011, 'OpenAI connection failed');
        return;
      }

      // Track if session is ready (must be defined before handlers)
      let sessionReady = false;
      let sessionCreated = false;

      // CRITICAL: Set up message handler IMMEDIATELY after creating WebSocket
      // This ensures we don't miss session.created which arrives right after open
      const handleOpenAIMessage = (data: Buffer | string) => {
        // Convert Buffer to string if needed (ws library sends text as Buffer)
        let messageStr: string;
        if (Buffer.isBuffer(data)) {
          // Try to parse as UTF-8 string (JSON messages)
          try {
            messageStr = data.toString('utf8');
            // Check if it looks like JSON (starts with { or [)
            if (!messageStr.trim().startsWith('{') && !messageStr.trim().startsWith('[')) {
              // Not JSON, likely binary audio - skip
              return;
            }
          } catch (e) {
            // Not valid UTF-8, likely binary audio - skip
            return;
          }
        } else if (typeof data === 'string') {
          messageStr = data;
        } else {
          // Unknown type, skip
          return;
        }

        try {
          const message = JSON.parse(messageStr);
          console.log(`[REALTIME] 📨 Parsed message: type=${message.type}`);
          logger.info(`[REALTIME] OpenAI message: type=${message.type}`);
          
          // Handle session.created - OpenAI creates session automatically
          if (message.type === 'session.created') {
            sessionCreated = true;
            logger.info('[REALTIME] Session created by OpenAI, now sending configuration...');
            
            // Now send session configuration
            const config = {
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'], // Order: text first, then audio
                instructions: systemPrompt,
                voice: 'alloy', // Valid voices: 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'
                input_audio_format: 'pcm16', // MUST match: 16-bit Linear PCM, 24000Hz, mono, little-endian
                output_audio_format: 'pcm16', // MUST match: 16-bit Linear PCM, 24000Hz, mono, little-endian
                input_audio_transcription: {
                  model: 'whisper-1',
                },
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
              const configString = JSON.stringify(config);
              logger.info('[REALTIME] Sending session.update configuration:');
              logger.info('[REALTIME] Config length:', configString.length);
              logger.info('[REALTIME] Instructions length:', systemPrompt.length);
              
              if (openaiWs.readyState === WebSocket.OPEN) {
                openaiWs.send(configString);
                logger.info('[REALTIME] Session configuration sent successfully');
              } else {
                logger.error(`[REALTIME] Cannot send config - WebSocket state: ${openaiWs.readyState}`);
              }
            } catch (error) {
              logger.error('[REALTIME] Error sending session config:', error);
            }
          }
          
          // Handle session.updated - configuration accepted
          if (message.type === 'session.updated') {
            sessionReady = true;
            logger.info('[REALTIME] Session updated successfully - ready for audio!');
            
            // Longer delay to ensure OpenAI is fully ready before accepting audio
            // This prevents sending audio too quickly after session update
            setTimeout(() => {
              // Notify client that OpenAI connection is ready
              if (ws.readyState === WebSocket.OPEN && openaiWs.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'connection.ready',
                  message: 'Connected to OpenAI',
                }));
                logger.info('[REALTIME] Sent connection.ready to client - audio can now be sent');
              }
            }, 500); // 500ms delay to ensure OpenAI is fully ready
          }
          
          // Handle error messages
          if (message.type === 'error') {
            logger.error('[REALTIME] OpenAI error:', JSON.stringify(message, null, 2));
          }
        } catch (parseError) {
          // Not JSON, will be handled below
        }
      };

      // Store connection BEFORE setting up handlers
      const connection: ClientConnection = {
        ws,
        userId,
        sessionId,
        openaiWs,
      };
      connections.set(ws, connection);

      // CRITICAL: Set up ALL handlers IMMEDIATELY after creating WebSocket
      // Order matters: message handler first, then open, then error/close

      // 1. Message handler - must be first to catch session.created
      openaiWs.on('message', (data: Buffer | string) => {
        const isBuffer = Buffer.isBuffer(data);
        const isString = typeof data === 'string';
        console.log('[REALTIME] 📨 Message received from OpenAI, type:', isBuffer ? 'Buffer' : isString ? 'string' : typeof data, 'length:', isBuffer ? data.length : isString ? data.length : 'unknown');
        
        // First, handle the message for our internal logic
        handleOpenAIMessage(data);
        
        // Then forward to client
        if (ws.readyState === WebSocket.OPEN) {
          try {
            // Handle both JSON and binary (audio) messages
            // ws library sends text messages as Buffers, so check if it's JSON
            if (isBuffer) {
              // Try to parse as JSON (text message)
              try {
                const messageStr = data.toString('utf8');
                // Check if it looks like JSON
                if (messageStr.trim().startsWith('{') || messageStr.trim().startsWith('[')) {
                  // It's a JSON message
                  const message = JSON.parse(messageStr);
                
                // Log important messages
                if (['error', 'session.created', 'session.updated'].includes(message.type)) {
                  logger.info(`[REALTIME] Forwarding ${message.type} to client`);
                }
                
                // Save transcripts
                if (message.type === 'input_audio_buffer.committed' && message.input_audio_buffer?.transcript) {
                  // User speech transcribed
                  saveTranscript(sessionId, 'user', message.input_audio_buffer.transcript);
                } else if (message.type === 'response.audio_transcript.done' && message.response?.audio_transcript) {
                  // AI response transcribed
                  saveTranscript(sessionId, 'assistant', message.response.audio_transcript);
                }
                
                  // Forward JSON message as string
                  ws.send(messageStr);
                } else {
                  // Not JSON, likely binary audio - forward as Buffer
                  logger.debug('[REALTIME] Forwarding binary audio from OpenAI:', data.length, 'bytes');
                  ws.send(data);
                }
              } catch (parseError) {
                // If parsing fails, it's likely binary audio - forward as Buffer
                logger.debug('[REALTIME] Forwarding binary audio from OpenAI (parse failed):', data.length, 'bytes');
                ws.send(data);
              }
            } else if (isString) {
              // String message - forward as-is
              try {
                const message = JSON.parse(data);
                
                // Log important messages
                if (['error', 'session.created', 'session.updated'].includes(message.type)) {
                  logger.info(`[REALTIME] Forwarding ${message.type} to client`);
                }
                
                // Save transcripts
                if (message.type === 'input_audio_buffer.committed' && message.input_audio_buffer?.transcript) {
                  saveTranscript(sessionId, 'user', message.input_audio_buffer.transcript);
                } else if (message.type === 'response.audio_transcript.done' && message.response?.audio_transcript) {
                  saveTranscript(sessionId, 'assistant', message.response.audio_transcript);
                }
                
                // Forward JSON message as string
                ws.send(data);
              } catch (parseError) {
                // If JSON parse fails, forward as string anyway
                logger.warn('[REALTIME] Failed to parse message, forwarding as string');
                ws.send(data);
              }
            }
          } catch (error) {
            logger.error('[REALTIME] Error forwarding message:', error);
          }
        }
      });

      // 2. Open handler - connection established
      openaiWs.on('open', () => {
        console.log('[REALTIME] ✅ OPEN EVENT FIRED!');
        clearTimeout(connectionTimeout);
        logger.info('[REALTIME] ✅ OpenAI WebSocket connected, readyState:', openaiWs.readyState);
        logger.info('[REALTIME] Waiting for session.created event...');
        
        // Don't send config yet - wait for session.created
      });

      // 3. Error handler
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
        console.error(`[REALTIME] ❌ CLOSE EVENT FIRED: code=${code}, reason="${reason?.toString()}"`);
        console.error(`[REALTIME] sessionCreated=${sessionCreated}, sessionReady=${sessionReady}`);
        logger.error(`[REALTIME] ❌ OpenAI WebSocket closed: code=${code}, reason="${reason?.toString()}"`);
        logger.error('[REALTIME] Connection closed details:', {
          code,
          reason: reason?.toString(),
          readyState: openaiWs.readyState,
          sessionCreated,
          sessionReady,
          timestamp: new Date().toISOString(),
        });
        
        // Log close code meanings
        const closeCodeMeanings: Record<number, string> = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data',
          1006: 'Abnormal closure',
          1007: 'Invalid frame payload data',
          1008: 'Policy violation',
          1009: 'Message too big',
          1010: 'Mandatory extension',
          1011: 'Internal server error',
          1012: 'Service restart',
          1013: 'Try again later',
          1014: 'Bad gateway',
          1015: 'TLS handshake',
        };
        
        logger.error(`Close code ${code} means: ${closeCodeMeanings[code] || 'Unknown'}`);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            error: `OpenAI connection closed: ${reason || 'Unknown reason'} (code: ${code})`,
          }));
          ws.close(1011, 'OpenAI connection closed');
        }
      });

      // CRITICAL: Forward messages from client to OpenAI
      // IMPORTANT: Only forward audio AFTER session.updated is received (sessionReady === true)
      ws.on('message', (data: Buffer | string) => {
        // Check if OpenAI connection is open AND session is ready
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN && sessionReady) {
          try {
            // Handle both JSON and binary (audio) messages
            if (typeof data === 'string') {
              // JSON message - forward as-is
              console.log('[REALTIME] Forwarding JSON from client to OpenAI:', data.substring(0, 100));
              openaiWs.send(data);
            } else {
              // Binary audio data - MUST be converted to base64 and sent as JSON
              // OpenAI Realtime API expects: { type: 'input_audio_buffer.append', audio: '<base64>' }
              
              // Validate audio data
              if (data.length === 0) {
                return; // Skip empty chunks
              }
              
              if (data.length > 20000) {
                logger.warn('[REALTIME] Audio chunk too large:', data.length, 'bytes - skipping');
                return; // Skip overly large chunks
              }
              
              // Verify it's PCM16 data (must be even number of bytes, 2 bytes per sample)
              if (data.length % 2 !== 0) {
                logger.warn('[REALTIME] Invalid PCM16 data - odd number of bytes:', data.length);
                return;
              }
              
              // Debug logging (first chunk only)
              if (!connection.audioChunksSent) {
                connection.audioChunksSent = 0;
                const view = new DataView(data.buffer, data.byteOffset, Math.min(10, data.length));
                const firstSample = view.getInt16(0, true); // little-endian
                console.log('[REALTIME] Audio received from client:');
                console.log('- Length:', data.length, 'bytes');
                console.log('- First 10 bytes:', Array.from(data.slice(0, 10)));
                console.log('- First sample value:', firstSample);
                console.log('- Is valid PCM16?', data.length % 2 === 0);
              }
              connection.audioChunksSent++;
              
              try {
                // CRITICAL: Convert Buffer to base64 and wrap in JSON message
                // OpenAI Realtime API requires this format, NOT raw binary
                const base64Audio = data.toString('base64');
                const audioEvent = {
                  type: 'input_audio_buffer.append',
                  audio: base64Audio,
                };
                
                // Send as JSON string
                openaiWs.send(JSON.stringify(audioEvent));
                
                // Only log occasionally to reduce noise
                if (connection.audioChunksSent % 50 === 0) {
                  console.log(`[REALTIME] Sent ${connection.audioChunksSent} audio chunks`);
                }
              } catch (error) {
                logger.error('[REALTIME] Error sending audio to OpenAI:', error);
              }
            }
          } catch (error) {
            logger.error('[REALTIME] Error forwarding message from client to OpenAI:', error);
          }
        } else {
          // Don't forward if session is not ready yet
          if (!sessionReady) {
            // Silently drop audio until session is ready (this is expected during setup)
            if (Buffer.isBuffer(data) && data.length > 1000) {
              // It's audio data - drop it silently until session is ready
              return;
            }
          }
          // Log only if it's not just audio being dropped
          if (openaiWs?.readyState !== WebSocket.OPEN) {
            logger.warn('[REALTIME] Cannot forward message - OpenAI WebSocket not open:', openaiWs?.readyState);
          } else if (!sessionReady) {
            // Session not ready yet - this is normal during setup
            logger.debug('[REALTIME] Dropping message - session not ready yet');
          }
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

