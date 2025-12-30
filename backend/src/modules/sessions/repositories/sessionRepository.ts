import prisma from '../../../config/database';
import { Session, SessionStatus, Message, MessageRole } from '@ai-english-speaker/shared';

export interface CreateSessionData {
  userId: string;
  topicId?: string;
  duration: number; // in minutes
}

export interface UpdateSessionData {
  status?: SessionStatus;
  endedAt?: Date;
  transcript?: string;
  summary?: string;
}

/**
 * Create a new session
 */
export async function createSession(data: CreateSessionData): Promise<Session> {
  const session = await prisma.session.create({
    data: {
      userId: data.userId,
      topicId: data.topicId,
      duration: data.duration,
      status: SessionStatus.PENDING,
    },
    include: {
      topic: true,
    },
  });

  return {
    id: session.id,
    userId: session.userId,
    topicId: session.topicId || undefined,
    duration: session.duration,
    startedAt: session.startedAt,
    endedAt: session.endedAt || undefined,
    transcript: session.transcript || undefined,
    summary: session.summary || undefined,
    status: session.status as SessionStatus,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      topic: true,
    },
  });

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    topicId: session.topicId || undefined,
    duration: session.duration,
    startedAt: session.startedAt,
    endedAt: session.endedAt || undefined,
    transcript: session.transcript || undefined,
    summary: session.summary || undefined,
    status: session.status as SessionStatus,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

/**
 * Update session
 */
export async function updateSession(
  sessionId: string,
  data: UpdateSessionData
): Promise<Session> {
  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.endedAt !== undefined && { endedAt: data.endedAt }),
      ...(data.transcript !== undefined && { transcript: data.transcript }),
      ...(data.summary !== undefined && { summary: data.summary }),
    },
    include: {
      topic: true,
    },
  });

  return {
    id: session.id,
    userId: session.userId,
    topicId: session.topicId || undefined,
    duration: session.duration,
    startedAt: session.startedAt,
    endedAt: session.endedAt || undefined,
    transcript: session.transcript || undefined,
    summary: session.summary || undefined,
    status: session.status as SessionStatus,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

/**
 * Get user's session history
 */
export async function getUserSessions(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Session[]> {
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      topic: true,
    },
  });

  return sessions.map((session: any) => ({
    id: session.id,
    userId: session.userId,
    topicId: session.topicId || undefined,
    duration: session.duration,
    startedAt: session.startedAt,
    endedAt: session.endedAt || undefined,
    transcript: session.transcript || undefined,
    summary: session.summary || undefined,
    status: session.status as SessionStatus,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }));
}

/**
 * Get active session for user
 */
export async function getActiveSession(userId: string): Promise<Session | null> {
  const session = await prisma.session.findFirst({
    where: {
      userId,
      status: SessionStatus.ACTIVE,
    },
    include: {
      topic: true,
    },
    orderBy: {
      startedAt: 'desc',
    },
  });

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    topicId: session.topicId || undefined,
    duration: session.duration,
    startedAt: session.startedAt,
    endedAt: session.endedAt || undefined,
    transcript: session.transcript || undefined,
    summary: session.summary || undefined,
    status: session.status as SessionStatus,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

/**
 * Get session messages
 */
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: 'asc' },
  });

  return messages.map((msg: any) => ({
    id: msg.id,
    sessionId: msg.sessionId,
    role: msg.role as MessageRole,
    content: msg.content,
    timestamp: msg.timestamp,
    createdAt: msg.createdAt,
  }));
}

/**
 * Add message to session
 */
export async function addMessage(
  sessionId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  const message = await prisma.message.create({
    data: {
      sessionId,
      role,
      content,
    },
  });

  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role as MessageRole,
    content: message.content,
    timestamp: message.timestamp,
    createdAt: message.createdAt,
  };
}

