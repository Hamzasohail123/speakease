import { Request, Response, NextFunction } from 'express';
import { sendFeedbackEmail } from '../services/emailService';
import { z } from 'zod';

const feedbackSchema = z.object({
  type: z.enum(['feedback', 'suggestion', 'bug', 'feature', 'other']),
  message: z.string().min(10).max(1000),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
});

export async function submitUserFeedback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validation = feedbackSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback data',
        details: validation.error.errors,
      });
    }

    const { type, message, userEmail, userName } = validation.data;
    
    // Get user info from auth if available (req.user is optional)
    const email = userEmail || (req as any).user?.email || 'anonymous@speakease.com';
    const name = userName || (req as any).user?.name || 'Anonymous User';

    // Send email
    await sendFeedbackEmail({
      type,
      message,
      userEmail: email,
      userName: name,
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
    });
  } catch (error) {
    next(error);
  }
}

