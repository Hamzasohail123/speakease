import { Router } from 'express';
import { authenticate } from '../../auth/middleware/authMiddleware';
import { initRealtimeSession } from './realtimeController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/conversation/realtime/init
 * @desc    Initialize OpenAI Realtime API session
 * @access  Private
 */
router.post('/init', initRealtimeSession);

export default router;

