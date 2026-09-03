import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

// Shared Redis connection — backs caching, rate limiting, and (later) BullMQ.
// If REDIS_URL isn't set (local dev without Redis), we export null and every
// caller falls back to "skip the cache / skip the limit" rather than crashing.
export const redis: Redis | null = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    })
  : null;

if (redis) {
  redis.on('connect', () => logger.info('✅ Redis connected'));
  redis.on('error', (error) => logger.error('Redis connection error', error));
} else {
  logger.warn('⚠️  REDIS_URL not set — caching and rate limiting are disabled');
}

/**
 * Cache read that fails open: any Redis error (unset, unreachable, timed out)
 * is logged and treated as a cache miss rather than surfaced to the caller.
 * A broken cache should never break a feature that worked fine without one.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    logger.warn(`Cache read failed for "${key}", falling back to source`, error);
    return null;
  }
}

/** Cache write that fails open — same reasoning as cacheGet. */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    logger.warn(`Cache write failed for "${key}"`, error);
  }
}
