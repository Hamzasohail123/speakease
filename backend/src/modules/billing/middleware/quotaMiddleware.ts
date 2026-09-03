import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../middleware/errorHandler';
import { getOrCreateQuota } from '../repositories/subscriptionRepository';
import { getPlanForUser, getLimitsForPlan } from '../services/planService';

/**
 * Blocks a request once the user's plan-based daily quota is exhausted.
 * Voice usage is measured in seconds *after* a request completes (duration isn't
 * known up front), so this only gates on usage already recorded — it can't catch
 * a single voice message that would itself blow past the cap.
 */
export function enforceQuota(mode: 'text' | 'voice') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const [plan, quota] = await Promise.all([
        getPlanForUser(req.user.id),
        getOrCreateQuota(req.user.id),
      ]);
      const limits = getLimitsForPlan(plan);

      if (mode === 'text' && quota.textMessagesUsed >= limits.textMessagesPerDay) {
        throw new AppError(
          'Daily message limit reached for your plan — upgrade for unlimited text conversations.',
          429
        );
      }

      if (mode === 'voice' && quota.voiceSecondsUsed >= limits.voiceSecondsPerDay) {
        throw new AppError(
          'Daily voice practice limit reached for your plan — upgrade for more voice minutes.',
          429
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
