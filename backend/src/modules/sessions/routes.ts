import { Router } from 'express';
import { authenticate } from '../auth/middleware/authMiddleware';
import {
  startSession,
  endSession,
  getSession,
  getHistory,
  getTranscript,
} from './controllers/sessionController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/sessions/start
 * @desc    Start a new session
 * @access  Private
 */
router.post('/start', startSession);

/**
 * @route   GET /api/v1/sessions/history
 * @desc    Get user's session history
 * @access  Private
 */
router.get('/history', getHistory);

/**
 * @route   GET /api/v1/sessions/:id
 * @desc    Get session by ID
 * @access  Private
 */
router.get('/:id', getSession);

/**
 * @route   POST /api/v1/sessions/:id/end
 * @desc    End a session
 * @access  Private
 */
router.post('/:id/end', endSession);

/**
 * @route   GET /api/v1/sessions/:id/transcript
 * @desc    Get session transcript (messages)
 * @access  Private
 */
router.get('/:id/transcript', getTranscript);

export default router;

