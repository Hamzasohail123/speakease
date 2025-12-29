import { Router } from 'express';
import { authenticate } from '../auth/middleware/authMiddleware';
import {
  getProfile,
  updateProfile,
  updateContext,
  addDocument,
} from './controllers/profileController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', updateProfile);

/**
 * @route   POST /api/v1/users/profile/context
 * @desc    Update user context (bio and goals)
 * @access  Private
 */
router.post('/profile/context', updateContext);

/**
 * @route   POST /api/v1/users/profile/documents
 * @desc    Add document to profile (future feature)
 * @access  Private
 */
router.post('/profile/documents', addDocument);

export default router;

