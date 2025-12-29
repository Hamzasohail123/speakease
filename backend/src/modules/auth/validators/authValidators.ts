import { z } from 'zod';
import { isValidEmail, isValidPassword } from '@ai-english-speaker/shared';

/**
 * Register request validation schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .refine((email) => isValidEmail(email), {
      message: 'Invalid email format',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((password) => isValidPassword(password), {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
});

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

