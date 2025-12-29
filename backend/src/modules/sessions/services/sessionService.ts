import { Session, SessionStatus, ERROR_MESSAGES, Message, MessageRole } from '@ai-english-speaker/shared';
import {
  createSession,
  getSessionById,
  updateSession,
  getUserSessions,
  getActiveSession,
  getSessionMessages,
  addMessage,
  CreateSessionData,
} from '../repositories/sessionRepository';
import { StartSessionInput, EndSessionInput } from '../validators/sessionValidators';
import { AppError } from '../../../middleware/errorHandler';
import { generateSessionFeedback } from '../../feedback/services/feedbackService';
import { logger } from '../../../utils/logger';

/**
 * Start a new session
 */
export async function startUserSession(
  userId: string,
  input: StartSessionInput
): Promise<Session> {
  // Check if user has an active session
  const activeSession = await getActiveSession(userId);
  if (activeSession) {
    throw new AppError('User already has an active session', 400);
  }

  // Validate topicId if provided (check if topic exists)
  let validatedTopicId: string | undefined = input.topicId;
  if (input.topicId) {
    const { getTopicById } = await import('../../topics/repositories/topicRepository');
    const topic = await getTopicById(input.topicId);
    if (!topic) {
      logger.warn(`Topic not found: ${input.topicId}, proceeding without topic`);
      validatedTopicId = undefined;
    }
  }

  // Create session
  const sessionData: CreateSessionData = {
    userId,
    duration: input.duration,
    topicId: validatedTopicId,
  };

  const session = await createSession(sessionData);

  // Activate session
  const activatedSession = await updateSession(session.id, {
    status: SessionStatus.ACTIVE,
  });

  return activatedSession;
}

/**
 * End a session
 */
export async function endUserSession(
  userId: string,
  sessionId: string,
  input?: EndSessionInput
): Promise<Session> {
  // Get session
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new AppError(ERROR_MESSAGES.SESSION_NOT_FOUND, 404);
  }

  // Verify session belongs to user
  if (session.userId !== userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, 403);
  }

  // Check if session is already ended
  if (session.status === SessionStatus.ENDED) {
    throw new AppError(ERROR_MESSAGES.SESSION_ENDED, 400);
  }

  // Update session
  const endedSession = await updateSession(sessionId, {
    status: SessionStatus.ENDED,
    endedAt: new Date(),
    ...(input?.transcript && { transcript: input.transcript }),
    ...(input?.summary && { summary: input.summary }),
  });

  // Automatically generate feedback (async, don't wait)
  generateSessionFeedback(userId, sessionId).catch((error) => {
    logger.error('Failed to generate feedback automatically:', error);
    // Don't throw - feedback generation failure shouldn't prevent session ending
  });

  return endedSession;
}

/**
 * Get session by ID (with user verification)
 */
export async function getUserSession(
  userId: string,
  sessionId: string
): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new AppError(ERROR_MESSAGES.SESSION_NOT_FOUND, 404);
  }

  // Verify session belongs to user
  if (session.userId !== userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, 403);
  }

  return session;
}

/**
 * Get user's session history
 */
export async function getUserSessionHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Session[]> {
  return await getUserSessions(userId, limit, offset);
}

/**
 * Get session transcript (messages)
 */
export async function getSessionTranscript(
  userId: string,
  sessionId: string
): Promise<Message[]> {
  // Verify session belongs to user
  const session = await getUserSession(userId, sessionId);

  // Get messages
  return await getSessionMessages(session.id);
}

/**
 * Add message to session
 */
export async function addMessageToSession(
  userId: string,
  sessionId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  // Verify session belongs to user and is active
  const session = await getUserSession(userId, sessionId);

  if (session.status !== SessionStatus.ACTIVE) {
    throw new AppError('Session is not active', 400);
  }

  // Add message
  return await addMessage(sessionId, role, content);
}

/**
 * Get active session for user
 */
export async function getActiveUserSession(userId: string): Promise<Session | null> {
  return await getActiveSession(userId);
}

