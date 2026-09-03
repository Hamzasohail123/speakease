import { PlanType } from '@prisma/client';
import { getOrCreateSubscription } from '../repositories/subscriptionRepository';

// Free-tier daily caps, from the SpeakEase Blueprint. Config values, not schema —
// tune post-launch against real usage/cost data without a migration.
export const PLAN_LIMITS: Record<PlanType, { textMessagesPerDay: number; voiceSecondsPerDay: number }> = {
  FREE: { textMessagesPerDay: 15, voiceSecondsPerDay: 10 * 60 },
  PLUS: { textMessagesPerDay: Infinity, voiceSecondsPerDay: 60 * 60 },
  PRO: { textMessagesPerDay: Infinity, voiceSecondsPerDay: Infinity },
  BUSINESS: { textMessagesPerDay: Infinity, voiceSecondsPerDay: Infinity },
};

// Model tiering by plan — deliberately a single-provider lookup, not a
// multi-provider abstraction. See the Technical Architecture doc's LLM strategy
// section for why: this captures nearly all the margin benefit of "different
// model per plan" without the engineering cost of a provider registry.
export const MODEL_FOR_PLAN: Record<PlanType, string> = {
  FREE: 'gpt-4o-mini',
  PLUS: 'gpt-4o',
  PRO: 'gpt-4o',
  BUSINESS: 'gpt-4o',
};

export async function getPlanForUser(userId: string): Promise<PlanType> {
  const subscription = await getOrCreateSubscription(userId);
  return subscription.plan;
}

export function getModelForPlan(plan: PlanType): string {
  return MODEL_FOR_PLAN[plan];
}

export function getLimitsForPlan(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

// Rough blended (input+output) cost per 1,000 tokens, in cents. For cost-trend
// auditing in UsageRecord, not billing-grade precision — revisit if/when actual
// per-model, per-token-type pricing needs to be exact.
const COST_CENTS_PER_1K_TOKENS: Record<string, number> = {
  'gpt-4o-mini': 0.02,
  'gpt-4o': 0.5,
  'claude-3-haiku-20240307': 0.03,
};

export function estimateCostCents(model: string, totalTokens: number): number {
  const rate = COST_CENTS_PER_1K_TOKENS[model] ?? COST_CENTS_PER_1K_TOKENS['gpt-4o'];
  return Math.round((totalTokens / 1000) * rate * 100) / 100;
}
