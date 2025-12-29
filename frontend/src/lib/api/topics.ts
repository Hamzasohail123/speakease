import { apiClient } from './client';
import { Topic } from '@ai-english-speaker/shared';

export const topicsApi = {
  getAll: async (category?: string): Promise<Topic[]> => {
    const url = category
      ? `/api/v1/topics?category=${category}`
      : '/api/v1/topics';
    const response = await apiClient.get<{ topics: Topic[] }>(url);
    return response.data!.topics;
  },

  getById: async (topicId: string): Promise<Topic> => {
    const response = await apiClient.get<{ topic: Topic }>(`/api/v1/topics/${topicId}`);
    return response.data!.topic;
  },

  getDaily: async (): Promise<Topic> => {
    const response = await apiClient.get<{ topic: Topic }>('/api/v1/topics/daily');
    return response.data!.topic;
  },

  getRandom: async (): Promise<Topic> => {
    const response = await apiClient.get<{ topic: Topic }>('/api/v1/topics/random');
    return response.data!.topic;
  },
};

