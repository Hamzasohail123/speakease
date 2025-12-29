// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  goals?: string[];
  documents?: string[]; // URLs or paths to uploaded documents
  createdAt: Date;
  updatedAt: Date;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  topicId?: string;
  duration: number; // in minutes
  startedAt: Date;
  endedAt?: Date;
  transcript?: string;
  summary?: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum SessionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

// Message Types
export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  createdAt: Date;
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

// Topic Types
export interface Topic {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isDaily: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Memory Types
export interface Memory {
  id: string;
  userId: string;
  sessionId?: string;
  content: string;
  embedding?: number[];
  summary: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Feedback Types
export interface Feedback {
  id: string;
  sessionId: string;
  mistakes: Mistake[];
  improvements: string[];
  tips: string[];
  reportJson: Record<string, any>;
  createdAt: Date;
}

export interface Mistake {
  category: string;
  incorrect: string;
  correct: string;
  explanation: string;
  frequency: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Session Request Types
export interface StartSessionRequest {
  duration: number;
  topicId?: string;
  customTopic?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
}

