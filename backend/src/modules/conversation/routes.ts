import { Router } from 'express';
import { authenticate } from '../auth/middleware/authMiddleware';
import { llmLimiter } from '../../middleware/rateLimiter';
import { enforceQuota } from '../billing/middleware/quotaMiddleware';
import {
  sendConversationMessage,
  getConversationMessages,
} from './controllers/conversationController';
import { processVoice, voiceUpload } from './controllers/voiceController';
import realtimeRoutes from './realtime/realtimeRoutes';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Realtime API routes
router.use('/realtime', realtimeRoutes);

/**
 * @route   POST /api/v1/conversation/message
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post('/message', llmLimiter, enforceQuota('text'), sendConversationMessage);

/**
 * @route   POST /api/v1/conversation/voice
 * @desc    Send a voice message (audio) and get audio response
 * @access  Private
 */
router.post('/voice', llmLimiter, enforceQuota('voice'), voiceUpload, processVoice);

/**
 * @route   GET /api/v1/conversation/:sessionId/messages
 * @desc    Get conversation messages for a session
 * @access  Private
 */
router.get('/:sessionId/messages', getConversationMessages);

export default router;

