import { Router } from 'express';
import { authenticate } from '../auth/middleware/authMiddleware';
import { getCheckoutConfig } from './controllers/billingController';

// The Paddle webhook route is NOT here — it's mounted directly in index.ts,
// before the app-wide express.json() middleware, because signature verification
// needs the raw request bytes and express.json() would already have consumed
// the stream by the time a route inside this router saw it. See index.ts.

const router = Router();

/**
 * @route   GET /api/v1/billing/checkout/:plan
 * @desc    Get the Paddle price ID + customer info for the frontend's checkout overlay
 * @access  Private
 */
router.get('/checkout/:plan', authenticate, getCheckoutConfig);

export default router;
