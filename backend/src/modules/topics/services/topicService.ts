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

/**
 * Get all topics
 */
export async function getAllTopicsService(): Promise<Topic[]> {
  return await getAllTopics();
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
 * Get daily topic
 */
export async function getDailyTopicService(): Promise<Topic> {
  const topic = await getDailyTopic();
  if (!topic) {
    // If no daily topic exists, return a random topic instead
    const randomTopic = await getRandomTopic();
    if (!randomTopic) {
      throw new AppError('No topics available', 404);
    }
    return randomTopic;
  }
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

