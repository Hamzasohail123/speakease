import { Request, Response, NextFunction } from 'express';
import { realtimeService } from './realtimeService';
import { getUserProfile } from '../../users/services/profileService';
import { getSessionById, getSessionMessages } from '../../sessions/repositories/sessionRepository';
import { getTopicById } from '../../topics/repositories/topicRepository';
import { getUserMemories } from '../../memory/services/memoryService';
import { MessageRole } from '@ai-english-speaker/shared';
import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';

/**
 * Initialize Realtime API session
 * POST /api/v1/conversation/realtime/init
 */
export async function initRealtimeSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    // Verify session belongs to user
    const session = await getSessionById(sessionId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Get user profile for context
    const userProfile = await getUserProfile(req.user.id);

    // Get topic if available
    let topic = null;
    if (session.topicId) {
      topic = await getTopicById(session.topicId);
    }

    // Get user memories
    const previousMemories = await getUserMemories(req.user.id, 5);

    // Get session history
    const existingMessages = await getSessionMessages(sessionId);
    const sessionHistory = existingMessages.map((msg) => ({
      role: msg.role === MessageRole.USER ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    // Build context
    const context = {
      userProfile: userProfile || undefined,
      topic: topic || undefined,
      previousMemories,
      sessionHistory,
    };

    // Build instructions for Realtime API
    const instructions = realtimeService.buildInstructions({
      userId: req.user.id,
      sessionId,
      context,
    });

    logger.info(`Realtime session initialized: sessionId=${sessionId}, userId=${req.user.id}`);

    res.json({
      success: true,
      data: {
        sessionId,
        instructions,
        // WebSocket URL will be: ws://localhost:3001/api/v1/conversation/realtime/ws?sessionId=xxx&token=xxx
      },
    });
  } catch (error) {
    next(error);
  }
}

