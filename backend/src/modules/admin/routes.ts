import { Router } from 'express';
import { testEmail, getStats, getAllUsers } from './controllers/adminController';

const router = Router();

/**
 * @route   GET /api/v1/admin/test-email
 * @desc    Test email configuration
 * @access  Public (for now - add auth later)
 */
router.get('/test-email', testEmail);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Public (for now - add auth later)
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users
 * @access  Public (for now - add auth later)
 */
router.get('/users', getAllUsers);

export default router;

