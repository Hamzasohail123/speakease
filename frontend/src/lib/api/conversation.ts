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
    console.log('Preparing voice message:', { sessionId, audioSize: audioBlob.size });
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('sessionId', sessionId);

    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    console.log('Sending to:', `${API_URL}/api/v1/conversation/voice`);

    try {
      const response = await fetch(`${API_URL}/api/v1/conversation/voice`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || 'Request failed' };
        }
        throw new Error(error.error || error.message || 'Failed to send voice message');
      }

      const data = await response.json();
      console.log('Voice message response:', data);
      console.log('User message content:', data.data?.userMessage?.content);
      console.log('Assistant message content:', data.data?.assistantMessage?.content);
      
      if (!data.data) {
        throw new Error('Invalid response format from server');
      }
      
      // Check if user message has content
      if (!data.data.userMessage?.content || data.data.userMessage.content.trim().length === 0) {
        console.error('User message is empty!', data.data);
        throw new Error('No speech was detected in your audio. Please speak clearly and try again.');
      }
      
      return data.data;
    } catch (error) {
      console.error('Voice message API error:', error);
      throw error;
    }
  },

  getMessages: async (sessionId: string): Promise<Message[]> => {
    const response = await apiClient.get<{ messages: Message[] }>(
      `/api/v1/conversation/${sessionId}/messages`
    );
    return response.data!.messages;
  },
};

