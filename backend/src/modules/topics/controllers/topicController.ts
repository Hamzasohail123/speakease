import { Request, Response, NextFunction } from 'express';
import {
  getAllTopicsService,
  getTopicByIdService,
  getTopicsByCategoryService,
  getDailyTopicService,
  getRandomTopicService,
} from '../services/topicService';

/**
 * Get all topics
 * GET /api/v1/topics
 */
export async function getAllTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;

    let topics;
    if (category) {
      topics = await getTopicsByCategoryService(category);
    } else {
      topics = await getAllTopicsService();
    }

    res.json({
      success: true,
      data: { topics },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get topic by ID
 * GET /api/v1/topics/:id
 */
export async function getTopicById(req: Request, res: Response, next: NextFunction) {
  try {
    const topicId = req.params.id;
    const topic = await getTopicByIdService(topicId);

    res.json({
      success: true,
      data: { topic },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get daily topic
 * GET /api/v1/topics/daily
 */
export async function getDailyTopic(req: Request, res: Response, next: NextFunction) {
  try {
    const topic = await getDailyTopicService();

    res.json({
      success: true,
      data: { topic },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get random topic
 * GET /api/v1/topics/random
 */
export async function getRandomTopic(req: Request, res: Response, next: NextFunction) {
  try {
    const topic = await getRandomTopicService();

    res.json({
      success: true,
      data: { topic },
    });
  } catch (error) {
    next(error);
  }
}

