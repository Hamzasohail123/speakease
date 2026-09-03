import { Request, Response, NextFunction } from 'express';
import { sendMessage } from '../services/conversationService';
import { getSessionMessages } from '../../sessions/repositories/sessionRepository';
import { getUserSession } from '../../sessions/services/sessionService';
import { sendMessageSchema } from '../validators/conversationValidators';
import { incrementTextUsage } from '../../billing/repositories/subscriptionRepository';
import { logger } from '../../../utils/logger';

/**
 * Send a message in a conversation
 * POST /api/v1/conversation/message
 */
export async function sendConversationMessage(
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

    // Validate input
    const validatedData = sendMessageSchema.parse(req.body);
    const sessionId = (req.body.sessionId || req.query.sessionId) as string;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    // Send message
    const result = await sendMessage(req.user.id, sessionId, validatedData.content);

    // Fire-and-forget: quota bookkeeping shouldn't delay or fail the response,
    // which has already been earned by a successful LLM call.
    incrementTextUsage(req.user.id).catch((error) =>
      logger.error('Failed to increment text usage quota', error)
    );

    res.json({
      success: true,
      data: {
        userMessage: result.message,
        assistantMessage: result.assistantMessage,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get conversation messages
 * GET /api/v1/conversation/:sessionId/messages
 */
export async function getConversationMessages(
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

    const sessionId = req.params.sessionId;

    // Verify session belongs to user
    await getUserSession(req.user.id, sessionId);

    // Get messages
    const messages = await getSessionMessages(sessionId);

    res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
}

