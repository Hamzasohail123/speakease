import { apiClient } from './client';
import { Feedback } from '@ai-english-speaker/shared';

export interface UserFeedbackRequest {
  type: 'feedback' | 'suggestion' | 'bug' | 'feature' | 'other';
  message: string;
  userEmail?: string;
  userName?: string;
}

export const feedbackApi = {
  get: async (sessionId: string): Promise<Feedback> => {
    const response = await apiClient.get<{ feedback: Feedback }>(
      `/api/v1/feedback/${sessionId}`
    );
    return response.data!.feedback;
  },

  generate: async (sessionId: string): Promise<Feedback> => {
    const response = await apiClient.post<{ feedback: Feedback }>(
      `/api/v1/feedback/${sessionId}/generate`
    );
    return response.data!.feedback;
  },

  getReport: async (sessionId: string): Promise<string> => {
    const response = await apiClient.get<{ report: string }>(
      `/api/v1/feedback/${sessionId}/report`
    );
    return response.data!.report;
  },

  submitUserFeedback: async (data: UserFeedbackRequest): Promise<void> => {
    // This endpoint doesn't require authentication, so we use fetch directly
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/api/v1/feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to submit feedback' }));
      throw new Error(error.error || 'Failed to submit feedback');
    }
  },
};

