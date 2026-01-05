import { User, ERROR_MESSAGES } from '@ai-english-speaker/shared';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import {
  createUser,
  findUserByEmail,
  findUserById,
  emailExists,
} from '../repositories/userRepository';
import { RegisterInput, LoginInput } from '../validators/authValidators';
import { AppError } from '../../../middleware/errorHandler';
import { notifyNewUserSignup } from './notificationService';
import { logger } from '../../../utils/logger';
import {
  generateVerificationToken,
  getVerificationTokenExpiry,
  sendVerificationEmail,
} from './emailVerificationService';

export interface AuthResponse {
  user: User;
  token?: string;
  refreshToken?: string;
}

/**
 * Register a new user
 */
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  // Check if email already exists
  const emailAlreadyExists = await emailExists(input.email);
  if (emailAlreadyExists) {
    throw new AppError(ERROR_MESSAGES.EMAIL_EXISTS, 409);
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Generate verification token
  const verificationToken = generateVerificationToken();
  const tokenExpiry = getVerificationTokenExpiry();

  // Create user with verification token
  const user = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpiry: tokenExpiry,
  });

  // Send verification email
  try {
    await sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    // Don't block registration, but log the error
  }

  // Send notification to admin (don't block signup if this fails)
  try {
    await notifyNewUserSignup(user);
  } catch (error) {
    logger.error('Failed to send new user notification:', error);
  }

  // Don't return tokens - user must verify email first
  return {
    user,
  };
}

/**
 * Login user
 */
export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  // Find user by email
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new AppError('Please verify your email address before logging in. Check your inbox for the verification email.', 403);
  }

  // Generate tokens
  const token = generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
    refreshToken,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.NOT_FOUND, 404);
  }

  return user;
}

