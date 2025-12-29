import prisma from '../../../config/database';
import { Feedback, Mistake } from '@ai-english-speaker/shared';

export interface CreateFeedbackData {
  sessionId: string;
  mistakes: Mistake[];
  improvements: string[];
  tips: string[];
  reportJson: Record<string, any>;
}

/**
 * Create feedback for a session
 */
export async function createFeedback(data: CreateFeedbackData): Promise<Feedback> {
  const feedback = await prisma.feedback.create({
    data: {
      sessionId: data.sessionId,
      mistakes: data.mistakes as any,
      improvements: data.improvements,
      tips: data.tips,
      reportJson: data.reportJson as any,
    },
  });

  return {
    id: feedback.id,
    sessionId: feedback.sessionId,
    mistakes: feedback.mistakes as any,
    improvements: feedback.improvements,
    tips: feedback.tips,
    reportJson: feedback.reportJson as any,
    createdAt: feedback.createdAt,
  };
}

/**
 * Get feedback by session ID
 */
export async function getFeedbackBySessionId(sessionId: string): Promise<Feedback | null> {
  const feedback = await prisma.feedback.findUnique({
    where: { sessionId },
  });

  if (!feedback) {
    return null;
  }

  return {
    id: feedback.id,
    sessionId: feedback.sessionId,
    mistakes: feedback.mistakes as any,
    improvements: feedback.improvements,
    tips: feedback.tips,
    reportJson: feedback.reportJson as any,
    createdAt: feedback.createdAt,
  };
}

/**
 * Check if feedback exists for session
 */
export async function feedbackExists(sessionId: string): Promise<boolean> {
  const feedback = await prisma.feedback.findUnique({
    where: { sessionId },
    select: { id: true },
  });

  return feedback !== null;
}

