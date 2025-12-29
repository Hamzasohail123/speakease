import prisma from '../../../config/database';
import { Topic } from '@ai-english-speaker/shared';

/**
 * Get all topics
 */
export async function getAllTopics(): Promise<Topic[]> {
  const topics = await prisma.topic.findMany({
    orderBy: { name: 'asc' },
  });

  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description || undefined,
    category: topic.category || undefined,
    isDaily: topic.isDaily,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  }));
}

/**
 * Get topic by ID
 */
export async function getTopicById(topicId: string): Promise<Topic | null> {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    return null;
  }

  return {
    id: topic.id,
    name: topic.name,
    description: topic.description || undefined,
    category: topic.category || undefined,
    isDaily: topic.isDaily,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };
}

/**
 * Get topics by category
 */
export async function getTopicsByCategory(category: string): Promise<Topic[]> {
  const topics = await prisma.topic.findMany({
    where: { category },
    orderBy: { name: 'asc' },
  });

  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description || undefined,
    category: topic.category || undefined,
    isDaily: topic.isDaily,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  }));
}

/**
 * Get daily topic
 */
export async function getDailyTopic(): Promise<Topic | null> {
  // Get the most recent daily topic, or any daily topic
  const topic = await prisma.topic.findFirst({
    where: { isDaily: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (!topic) {
    return null;
  }

  return {
    id: topic.id,
    name: topic.name,
    description: topic.description || undefined,
    category: topic.category || undefined,
    isDaily: topic.isDaily,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };
}

/**
 * Get random topic
 */
export async function getRandomTopic(): Promise<Topic | null> {
  // Get count of topics
  const count = await prisma.topic.count();

  if (count === 0) {
    return null;
  }

  // Get random topic
  const randomIndex = Math.floor(Math.random() * count);
  const topic = await prisma.topic.findMany({
    take: 1,
    skip: randomIndex,
  });

  if (topic.length === 0) {
    return null;
  }

  const selectedTopic = topic[0];

  return {
    id: selectedTopic.id,
    name: selectedTopic.name,
    description: selectedTopic.description || undefined,
    category: selectedTopic.category || undefined,
    isDaily: selectedTopic.isDaily,
    createdAt: selectedTopic.createdAt,
    updatedAt: selectedTopic.updatedAt,
  };
}

/**
 * Get topics by category list
 */
export async function getTopicsByCategories(
  categories: string[]
): Promise<Topic[]> {
  const topics = await prisma.topic.findMany({
    where: {
      category: {
        in: categories,
      },
    },
    orderBy: { name: 'asc' },
  });

  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description || undefined,
    category: topic.category || undefined,
    isDaily: topic.isDaily,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  }));
}

