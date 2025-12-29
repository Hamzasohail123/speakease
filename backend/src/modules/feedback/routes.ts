import { Router } from 'express';
import { authenticate } from '../auth/middleware/authMiddleware';
import {
  getFeedback,
  generateFeedback,
  getReport,
} from './controllers/feedbackController';
import { submitUserFeedback } from './controllers/userFeedbackController';

const router = Router();

/**
 * @route   POST /api/v1/feedback/submit
 * @desc    Submit user feedback/suggestions (public route)
 * @access  Public (optional auth)
 */
router.post('/submit', submitUserFeedback);

// All other routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/feedback/:sessionId
 * @desc    Get feedback for a session (generates if doesn't exist)
 * @access  Private
 */
router.get('/:sessionId', getFeedback);

/**
 * @route   POST /api/v1/feedback/:sessionId/generate
 * @desc    Generate feedback for a session
 * @access  Private
 */
router.post('/:sessionId/generate', generateFeedback);

/**
 * @route   GET /api/v1/feedback/:sessionId/report
 * @desc    Get formatted report for a session
 * @access  Private
 */
router.get('/:sessionId/report', getReport);

export default router;

