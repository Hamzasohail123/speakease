import { apiClient } from './client';
import { Message } from '@ai-english-speaker/shared';

export const conversationApi = {
  sendMessage: async (sessionId: string, content: string): Promise<{
    userMessage: Message;
    assistantMessage: Message;
  }> => {
    const response = await apiClient.post<{
      userMessage: Message;
      assistantMessage: Message;
    }>('/api/v1/conversation/message', {
      sessionId,
      content,
    });
    return response.data!;
  },

  sendVoiceMessage: async (sessionId: string, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('sessionId', sessionId);

    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/api/v1/conversation/voice`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Failed to send voice message');
    }

    const data = await response.json();
    return data.data;
  },

  getMessages: async (sessionId: string): Promise<Message[]> => {
    const response = await apiClient.get<{ messages: Message[] }>(
      `/api/v1/conversation/${sessionId}/messages`
    );
    return response.data!.messages;
  },
};

