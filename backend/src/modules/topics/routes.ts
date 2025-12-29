import { Router } from 'express';
import {
  getAllTopics,
  getTopicById,
  getDailyTopic,
  getRandomTopic,
} from './controllers/topicController';

const router = Router();

/**
 * @route   GET /api/v1/topics
 * @desc    Get all topics (optionally filtered by category)
 * @access  Public
 */
router.get('/', getAllTopics);

/**
 * @route   GET /api/v1/topics/daily
 * @desc    Get daily topic
 * @access  Public
 */
router.get('/daily', getDailyTopic);

/**
 * @route   GET /api/v1/topics/random
 * @desc    Get random topic
 * @access  Public
 */
router.get('/random', getRandomTopic);

/**
 * @route   GET /api/v1/topics/:id
 * @desc    Get topic by ID
 * @access  Public
 */
router.get('/:id', getTopicById);

export default router;

