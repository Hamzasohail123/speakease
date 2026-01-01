import prisma from '../../../config/database';
import { logger } from '../../../utils/logger';

/**
 * Memory Service
 * Fetches user memories from pgvector database
 */

/**
 * Get relevant memories for a user
 * Returns the most recent memories (for now - can be enhanced with vector search later)
 */
export async function getUserMemories(
  userId: string,
  limit: number = 5
): Promise<string[]> {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        summary: true,
      },
    });

    return memories.map((m) => m.summary);
  } catch (error) {
    logger.error('Error fetching user memories:', error);
    return [];
  }
}

/**
 * Get memories for a specific session
 */
export async function getSessionMemories(
  sessionId: string,
  limit: number = 3
): Promise<string[]> {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        summary: true,
      },
    });

    return memories.map((m) => m.summary);
  } catch (error) {
    logger.error('Error fetching session memories:', error);
    return [];
  }
}

