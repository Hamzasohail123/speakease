import { apiClient } from './client';
import { UserProfile } from '@ai-english-speaker/shared';

export const profileApi = {
  get: async (): Promise<UserProfile> => {
    const response = await apiClient.get<{ profile: UserProfile }>('/api/v1/users/profile');
    return response.data!.profile;
  },

  update: async (data: { bio?: string; goals?: string[] }): Promise<UserProfile> => {
    const response = await apiClient.put<{ profile: UserProfile }>(
      '/api/v1/users/profile',
      data
    );
    return response.data!.profile;
  },

  updateContext: async (data: { bio?: string; goals?: string[] }): Promise<UserProfile> => {
    const response = await apiClient.post<{ profile: UserProfile }>(
      '/api/v1/users/profile/context',
      data
    );
    return response.data!.profile;
  },
};

