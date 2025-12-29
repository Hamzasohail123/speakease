import { z } from 'zod';
import { SESSION_DURATIONS } from '@ai-english-speaker/shared';

/**
 * Start session validation schema
 */
export const startSessionSchema = z.object({
  duration: z
    .number()
    .int('Duration must be an integer')
    .refine((val) => SESSION_DURATIONS.includes(val as any), {
      message: `Duration must be one of: ${SESSION_DURATIONS.join(', ')} minutes`,
    }),
  topicId: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.trim() !== '' && val !== 'random'),
      { message: 'Topic ID cannot be empty if provided' }
    )
    .transform((val) => {
      // Normalize topicId: if empty, 'random', or invalid, return undefined
      if (!val || val.trim() === '' || val === 'random') {
        return undefined;
      }
      return val.trim();
    }),
  customTopic: z.string().max(100, 'Custom topic too long').optional(),
});

/**
 * End session validation schema
 */
export const endSessionSchema = z.object({
  transcript: z.string().optional(),
  summary: z.string().optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;

