import { Request, Response, NextFunction } from 'express';
import {
  startUserSession,
  endUserSession,
  getUserSession,
  getUserSessionHistory,
  getSessionTranscript,
} from '../services/sessionService';
import { startSessionSchema, endSessionSchema } from '../validators/sessionValidators';

/**
 * Start a new session
 * POST /api/v1/sessions/start
 */
export async function startSession(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate input
    const validatedData = startSessionSchema.parse(req.body);

    // Start session
    const session = await startUserSession(req.user.id, validatedData);

    res.status(201).json({
      success: true,
      data: { session },
      message: 'Session started successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * End a session
 * POST /api/v1/sessions/:id/end
 */
export async function endSession(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const sessionId = req.params.id;

    // Validate input (optional)
    const validatedData = endSessionSchema.parse(req.body || {});

    // End session
    const session = await endUserSession(req.user.id, sessionId, validatedData);

    res.json({
      success: true,
      data: { session },
      message: 'Session ended successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get session by ID
 * GET /api/v1/sessions/:id
 */
export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const sessionId = req.params.id;
    const session = await getUserSession(req.user.id, sessionId);

    res.json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's session history
 * GET /api/v1/sessions/history
 */
export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Fetch all sessions - use a very high limit to get all
    const limit = parseInt(req.query.limit as string) || 10000;
    const offset = parseInt(req.query.offset as string) || 0;

    const sessions = await getUserSessionHistory(req.user.id, limit, offset);

    res.json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get session transcript
 * GET /api/v1/sessions/:id/transcript
 */
export async function getTranscript(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const sessionId = req.params.id;
    const messages = await getSessionTranscript(req.user.id, sessionId);

    res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
}

