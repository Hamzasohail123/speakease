import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PlanType } from '@prisma/client';
import { env } from '../../../config/env';
import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';
import { upsertSubscriptionFromPaddle } from '../repositories/subscriptionRepository';
import { findUserById } from '../../auth/repositories/userRepository';

// Paddle Billing price IDs, one per paid plan — set these once the Paddle
// dashboard has real products/prices configured. Free/Business are handled
// outside Paddle checkout (Business is a manually-negotiated contract).
const PADDLE_PRICE_TO_PLAN: Record<string, PlanType> = {
  [env.PADDLE_PRICE_ID_PLUS]: PlanType.PLUS,
  [env.PADDLE_PRICE_ID_PRO]: PlanType.PRO,
};

/**
 * GET /api/v1/billing/checkout/:plan
 * Returns the Paddle price ID for the requested plan so the frontend can open
 * Paddle.js's hosted overlay checkout — Paddle Billing checkout is client-side,
 * unlike Stripe's server-created Checkout Session.
 */
export async function getCheckoutConfig(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const plan = req.params.plan?.toUpperCase();
    const priceId =
      plan === 'PLUS' ? env.PADDLE_PRICE_ID_PLUS : plan === 'PRO' ? env.PADDLE_PRICE_ID_PRO : undefined;

    if (!priceId) {
      throw new AppError('Unknown or unconfigured plan', 400);
    }

    res.json({
      success: true,
      data: {
        priceId,
        customerEmail: req.user.email,
        // Paddle.js reads this to link the resulting subscription back to our user.
        customData: { userId: req.user.id },
      },
    });
  } catch (error) {
    next(error);
  }
}

function verifyPaddleSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  if (!signatureHeader || !env.PADDLE_WEBHOOK_SECRET) return false;

  // Paddle Billing signs as "ts=<timestamp>;h1=<hmac-sha256-hex>"
  const parts = Object.fromEntries(
    signatureHeader.split(';').map((p) => p.split('=') as [string, string])
  );
  if (!parts.ts || !parts.h1) return false;

  const signedPayload = `${parts.ts}:${rawBody}`;
  const expected = crypto
    .createHmac('sha256', env.PADDLE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.h1));
}

/**
 * POST /api/v1/billing/webhooks/paddle
 * Requires the raw request body for signature verification — mounted with
 * express.raw() in routes.ts rather than the app-wide express.json().
 */
export async function handlePaddleWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const rawBody = (req.body as Buffer).toString('utf8');
    const signature = req.headers['paddle-signature'] as string | undefined;

    if (!verifyPaddleSignature(rawBody, signature)) {
      throw new AppError('Invalid webhook signature', 401);
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type as string;
    const data = event.data;

    logger.info(`Paddle webhook received: ${eventType}`);

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.activated': {
        const userId = data.custom_data?.userId;
        if (!userId) {
          logger.warn('Paddle webhook missing custom_data.userId', { eventType });
          break;
        }

        const user = await findUserById(userId);
        if (!user) {
          logger.warn(`Paddle webhook references unknown userId: ${userId}`);
          break;
        }

        const priceId = data.items?.[0]?.price?.id;
        const plan = PADDLE_PRICE_TO_PLAN[priceId] ?? PlanType.FREE;

        await upsertSubscriptionFromPaddle({
          userId,
          plan,
          status: data.status,
          paddleCustomerId: data.customer_id,
          paddleSubscriptionId: data.id,
          currentPeriodEnd: data.current_billing_period?.ends_at
            ? new Date(data.current_billing_period.ends_at)
            : undefined,
          cancelAtPeriodEnd: Boolean(data.scheduled_change?.action === 'cancel'),
        });
        break;
      }

      case 'subscription.canceled': {
        const userId = data.custom_data?.userId;
        if (!userId) break;

        await upsertSubscriptionFromPaddle({
          userId,
          plan: PlanType.FREE,
          status: 'CANCELLED',
          paddleCustomerId: data.customer_id,
          paddleSubscriptionId: data.id,
        });
        break;
      }

      default:
        logger.info(`Unhandled Paddle webhook event: ${eventType}`);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
