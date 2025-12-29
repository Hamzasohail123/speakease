// Session Constants
export const SESSION_DURATIONS = [5, 10, 15] as const;
export type SessionDuration = (typeof SESSION_DURATIONS)[number];

// Topic Categories
export const TOPIC_CATEGORIES = [
  'daily-routine',
  'job-career',
  'travel',
  'opinions',
  'hobbies',
  'technology',
  'food',
  'sports',
] as const;

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

// Mistake Categories
export const MISTAKE_CATEGORIES = [
  'tense-confusion',
  'have-had-has',
  'prepositions',
  'sentence-structure',
  'pronunciation',
  'vocabulary',
  'articles',
] as const;

export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];

// API Routes
export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
  },
  USERS: {
    PROFILE: '/api/v1/users/profile',
    CONTEXT: '/api/v1/users/profile/context',
    DOCUMENTS: '/api/v1/users/profile/documents',
  },
  SESSIONS: {
    START: '/api/v1/sessions/start',
    END: '/api/v1/sessions/:id/end',
    GET: '/api/v1/sessions/:id',
    HISTORY: '/api/v1/sessions/history',
    TRANSCRIPT: '/api/v1/sessions/:id/transcript',
  },
  CONVERSATION: {
    MESSAGE: '/api/v1/conversation/message',
    MESSAGES: '/api/v1/conversation/:sessionId/messages',
    STREAM: '/api/v1/conversation/stream',
  },
  TOPICS: {
    LIST: '/api/v1/topics',
    DAILY: '/api/v1/topics/daily',
    RANDOM: '/api/v1/topics/random',
  },
  MEMORY: {
    CONTEXT: '/api/v1/memory/context',
    GENERATE: '/api/v1/memory/generate',
  },
  FEEDBACK: {
    GET: '/api/v1/feedback/:sessionId',
    REPORT: '/api/v1/feedback/:sessionId/report',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  SESSION_NOT_FOUND: 'Session not found',
  SESSION_ENDED: 'Session has already ended',
} as const;

