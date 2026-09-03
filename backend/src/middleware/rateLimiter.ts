import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';

// Redis-backed when available so limits hold across multiple backend instances;
// falls back to express-rate-limit's in-memory store in local dev without Redis
// (per-instance only — fine for one dev process, not for production). Each
// limiter needs its own RedisStore instance (with a distinct prefix) — sharing
// one across limiters is rejected by express-rate-limit at startup.
function makeStore(prefix: string) {
  return redis
    ? new RedisStore({
        sendCommand: (command: string, ...args: string[]) =>
          redis.call(command, ...args) as Promise<any>,
        prefix,
      })
    : undefined;
}

// General ceiling across the whole API — protects the server itself, not cost.
// passOnStoreError: a Redis outage should degrade rate limiting (fail open), not
// take every route down with it — same fail-open principle as config/redis.ts's
// cache helpers.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:api:'),
  passOnStoreError: true,
  message: { success: false, error: 'Too many requests — please slow down.' },
});

// Tighter limit specifically on LLM/voice-backed routes — these cost real money
// per call, independent of the plan-based daily quota enforced separately.
export const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:llm:'),
  passOnStoreError: true,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  message: { success: false, error: 'Too many requests — please wait a moment and try again.' },
});
