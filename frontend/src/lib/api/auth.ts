import { apiClient } from './client';
import { AuthResponse, RegisterRequest, LoginRequest, User } from '@ai-english-speaker/shared';

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    if (response.data) {
      apiClient.setToken(response.data.token);
    }
    return response.data!;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
    if (response.data) {
      apiClient.setToken(response.data.token);
    }
    return response.data!;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
    apiClient.removeToken();
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/api/v1/auth/me');
    return response.data!.user;
  },
};

