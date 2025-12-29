import { z } from 'zod';

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  goals: z
    .array(z.string().min(1, 'Goal cannot be empty').max(100, 'Goal too long'))
    .max(10, 'Maximum 10 goals allowed')
    .optional(),
});

/**
 * Update context validation schema
 */
export const updateContextSchema = z.object({
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  goals: z
    .array(z.string().min(1, 'Goal cannot be empty').max(100, 'Goal too long'))
    .max(10, 'Maximum 10 goals allowed')
    .optional(),
});

/**
 * Add document validation schema (future)
 */
export const addDocumentSchema = z.object({
  documentUrl: z.string().url('Invalid document URL'),
  documentName: z.string().min(1, 'Document name is required').max(255, 'Name too long'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateContextInput = z.infer<typeof updateContextSchema>;
export type AddDocumentInput = z.infer<typeof addDocumentSchema>;

