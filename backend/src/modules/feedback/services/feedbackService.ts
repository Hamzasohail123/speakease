import { Feedback, ERROR_MESSAGES } from '@ai-english-speaker/shared';
import { createFeedback, getFeedbackBySessionId, feedbackExists } from '../repositories/feedbackRepository';
import { analyzeTranscript } from './analysisService';
import { getSessionMessages } from '../../sessions/repositories/sessionRepository';
import { getUserSession } from '../../sessions/services/sessionService';
import { AppError } from '../../../middleware/errorHandler';
import { generateReport } from './reportService';

/**
 * Generate feedback for a session
 */
export async function generateSessionFeedback(
  userId: string,
  sessionId: string
): Promise<Feedback> {
  // Verify session belongs to user
  const session = await getUserSession(userId, sessionId);

  // Check if feedback already exists
  const existing = await getFeedbackBySessionId(sessionId);
  if (existing) {
    return existing;
  }

  // Get session messages/transcript
  const messages = await getSessionMessages(sessionId);

  if (messages.length === 0) {
    throw new AppError('No conversation found for this session', 400);
  }

  // Build transcript (only user messages for analysis)
  const userMessages = messages
    .filter((msg) => msg.role === 'USER')
    .map((msg) => msg.content)
    .join('\n');

  if (!userMessages.trim()) {
    throw new AppError('No user messages found in session', 400);
  }

  // Get previous mistakes (for context) - TODO: implement when Module 7 is built
  const previousMistakes: any[] = [];

  // Analyze transcript
  const analysis = await analyzeTranscript(userMessages, previousMistakes);

  // Create feedback record
  const feedback = await createFeedback({
    sessionId,
    mistakes: analysis.mistakes,
    improvements: analysis.improvements,
    tips: analysis.tips,
    reportJson: {
      reportText: analysis.reportText,
      mistakes: analysis.mistakes,
      improvements: analysis.improvements,
      tips: analysis.tips,
      generatedAt: new Date().toISOString(),
    },
  });

  return feedback;
}

/**
 * Get feedback for a session
 */
export async function getSessionFeedback(
  userId: string,
  sessionId: string
): Promise<Feedback> {
  // Verify session belongs to user
  await getUserSession(userId, sessionId);

  // Get feedback
  const feedback = await getFeedbackBySessionId(sessionId);
  if (!feedback) {
    // Generate feedback if it doesn't exist
    return await generateSessionFeedback(userId, sessionId);
  }

  return feedback;
}

/**
 * Get formatted report for a session
 */
export async function getSessionReport(
  userId: string,
  sessionId: string
): Promise<string> {
  const feedback = await getSessionFeedback(userId, sessionId);
  return generateReport(feedback);
}

