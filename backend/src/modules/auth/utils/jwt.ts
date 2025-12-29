import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: { id: string; email: string }): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(user: { id: string; email: string }): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

