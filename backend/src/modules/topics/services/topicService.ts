import { Topic, ERROR_MESSAGES } from '@ai-english-speaker/shared';
import {
  getAllTopics,
  getTopicById,
  getTopicsByCategory,
  getDailyTopic,
  getRandomTopic,
  getTopicsByCategories,
} from '../repositories/topicRepository';
import { AppError } from '../../../middleware/errorHandler';
import { cacheGet, cacheSet } from '../../../config/redis';

const ALL_TOPICS_CACHE_KEY = 'cache:topics:all';
const DAILY_TOPIC_CACHE_KEY = 'cache:topics:daily';
const ALL_TOPICS_TTL_SECONDS = 60 * 60; // topics change rarely
const DAILY_TOPIC_TTL_SECONDS = 60 * 60 * 24;

/**
 * Get all topics — cached, since this is fetched on every session start and
 * topics change on the order of days/weeks, not per-request. Cache reads/writes
 * fail open (see config/redis.ts), so a Redis outage falls back to the database
 * instead of breaking this endpoint.
 */
export async function getAllTopicsService(): Promise<Topic[]> {
  const cached = await cacheGet<Topic[]>(ALL_TOPICS_CACHE_KEY);
  if (cached) return cached;

  const topics = await getAllTopics();
  await cacheSet(ALL_TOPICS_CACHE_KEY, topics, ALL_TOPICS_TTL_SECONDS);
  return topics;
}

/**
 * Get topic by ID
 */
export async function getTopicByIdService(topicId: string): Promise<Topic> {
  const topic = await getTopicById(topicId);
  if (!topic) {
    throw new AppError(ERROR_MESSAGES.NOT_FOUND, 404);
  }
  return topic;
}

/**
 * Get topics by category
 */
export async function getTopicsByCategoryService(
  category: string
): Promise<Topic[]> {
  return await getTopicsByCategory(category);
}

/**
 * Get daily topic — cached for a day; the random-topic fallback (when no daily
 * topic is configured) intentionally isn't cached, so it still varies per call.
 */
export async function getDailyTopicService(): Promise<Topic> {
  const cached = await cacheGet<Topic>(DAILY_TOPIC_CACHE_KEY);
  if (cached) return cached;

  const topic = await getDailyTopic();
  if (!topic) {
    // If no daily topic exists, return a random topic instead
    const randomTopic = await getRandomTopic();
    if (!randomTopic) {
      throw new AppError('No topics available', 404);
    }
    return randomTopic;
  }

  await cacheSet(DAILY_TOPIC_CACHE_KEY, topic, DAILY_TOPIC_TTL_SECONDS);
  return topic;
}

/**
 * Get random topic
 */
export async function getRandomTopicService(): Promise<Topic> {
  const topic = await getRandomTopic();
  if (!topic) {
    throw new AppError('No topics available', 404);
  }
  return topic;
}

/**
 * Get topics by multiple categories
 */
export async function getTopicsByCategoriesService(
  categories: string[]
): Promise<Topic[]> {
  return await getTopicsByCategories(categories);
}

