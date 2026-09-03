import prisma from '../../../config/database';
import { PlanType, Subscription, UsageQuota } from '@prisma/client';

function startOfNextDayUTC(): Date {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}

/**
 * Every user has exactly one Subscription row, created lazily on first access
 * (defaults to FREE) rather than at signup — keeps auth untouched.
 */
export async function getOrCreateSubscription(userId: string): Promise<Subscription> {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.subscription.create({
    data: { userId, plan: PlanType.FREE },
  });
}

/**
 * Quota resets daily (UTC midnight) rather than monthly — matches the Free plan's
 * per-day message/voice limits from the blueprint. Lazily reset on read: if the
 * stored row is past its reset time, zero it out before returning.
 */
export async function getOrCreateQuota(userId: string): Promise<UsageQuota> {
  const existing = await prisma.usageQuota.findUnique({ where: { userId } });

  if (!existing) {
    return prisma.usageQuota.create({
      data: { userId, periodResetAt: startOfNextDayUTC() },
    });
  }

  if (existing.periodResetAt <= new Date()) {
    return prisma.usageQuota.update({
      where: { userId },
      data: {
        textMessagesUsed: 0,
        voiceSecondsUsed: 0,
        periodResetAt: startOfNextDayUTC(),
      },
    });
  }

  return existing;
}

export async function incrementTextUsage(userId: string, count = 1): Promise<void> {
  await prisma.usageQuota.update({
    where: { userId },
    data: { textMessagesUsed: { increment: count } },
  });
}

export async function incrementVoiceUsage(userId: string, seconds: number): Promise<void> {
  await prisma.usageQuota.update({
    where: { userId },
    data: { voiceSecondsUsed: { increment: Math.max(0, Math.round(seconds)) } },
  });
}

export async function recordUsage(params: {
  userId: string;
  sessionId?: string;
  model: string;
  tokens: number;
  costCents: number;
}): Promise<void> {
  await prisma.usageRecord.create({ data: params });
}

export async function upsertSubscriptionFromPaddle(params: {
  userId: string;
  plan: PlanType;
  status: string;
  paddleCustomerId: string;
  paddleSubscriptionId: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}): Promise<Subscription> {
  const { userId, ...data } = params;
  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
