import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../services/authService';
import { registerSchema, loginSchema } from '../validators/authValidators';
import { AppError } from '../../../middleware/errorHandler';
import { ERROR_MESSAGES } from '@ai-english-speaker/shared';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const result = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await loginUser(validatedData);

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const user = await getUserById(req.user.id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user (client-side token removal)
 * POST /api/v1/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    // In a JWT-based system, logout is handled client-side by removing the token
    // If using refresh tokens, you could invalidate them here
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
}

