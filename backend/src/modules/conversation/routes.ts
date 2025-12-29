import { Router } from 'express';
import { authenticate } from '../auth/middleware/authMiddleware';
import {
  sendConversationMessage,
  getConversationMessages,
} from './controllers/conversationController';
import { processVoice, voiceUpload } from './controllers/voiceController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/conversation/message
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post('/message', sendConversationMessage);

/**
 * @route   POST /api/v1/conversation/voice
 * @desc    Send a voice message (audio) and get audio response
 * @access  Private
 */
router.post('/voice', voiceUpload, processVoice);

/**
 * @route   GET /api/v1/conversation/:sessionId/messages
 * @desc    Get conversation messages for a session
 * @access  Private
 */
router.get('/:sessionId/messages', getConversationMessages);

export default router;

