import { apiClient } from './client';
import { Session, StartSessionRequest, Message } from '@ai-english-speaker/shared';

export const sessionsApi = {
  start: async (data: StartSessionRequest): Promise<Session> => {
    const response = await apiClient.post<{ session: Session }>('/api/v1/sessions/start', data);
    return response.data!.session;
  },

  end: async (sessionId: string, transcript?: string, summary?: string): Promise<Session> => {
    const response = await apiClient.post<{ session: Session }>(
      `/api/v1/sessions/${sessionId}/end`,
      { transcript, summary }
    );
    return response.data!.session;
  },

  getById: async (sessionId: string): Promise<Session> => {
    const response = await apiClient.get<{ session: Session }>(`/api/v1/sessions/${sessionId}`);
    return response.data!.session;
  },

  getHistory: async (limit?: number, offset = 0): Promise<Session[]> => {
    // If no limit provided, fetch all sessions
    const limitParam = limit ? `limit=${limit}&` : '';
    const response = await apiClient.get<{ sessions: Session[] }>(
      `/api/v1/sessions/history?${limitParam}offset=${offset}`
    );
    return response.data!.sessions;
  },

  getTranscript: async (sessionId: string): Promise<Message[]> => {
    const response = await apiClient.get<{ messages: Message[] }>(
      `/api/v1/sessions/${sessionId}/transcript`
    );
    return response.data!.messages;
  },
};

