import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { findUserById } from '../repositories/userRepository';
import { AppError } from '../../../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-english-speaker/shared';

/**
 * Middleware to authenticate requests
 * Adds user to req.user if token is valid
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Get user from database
    const user = await findUserById(payload.userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401));
    }
  }
}

/**
 * Optional authentication middleware
 * Adds user to req.user if token is valid, but doesn't fail if no token
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.userId);

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
}

