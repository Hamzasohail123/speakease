import { Request, Response, NextFunction } from 'express';
import {
  getSessionFeedback,
  generateSessionFeedback,
  getSessionReport,
} from '../services/feedbackService';

/**
 * Get feedback for a session
 * GET /api/v1/feedback/:sessionId
 */
export async function getFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const sessionId = req.params.sessionId;
    const feedback = await getSessionFeedback(req.user.id, sessionId);

    res.json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate feedback for a session
 * POST /api/v1/feedback/:sessionId/generate
 */
export async function generateFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const sessionId = req.params.sessionId;
    const feedback = await generateSessionFeedback(req.user.id, sessionId);

    res.json({
      success: true,
      data: { feedback },
      message: 'Feedback generated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get formatted report for a session
 * GET /api/v1/feedback/:sessionId/report
 */
export async function getReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const sessionId = req.params.sessionId;
    const report = await getSessionReport(req.user.id, sessionId);

    res.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
}

