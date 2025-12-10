import { apiClient } from './api';

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authApi = {
  register: async (
    email: string,
    password: string,
    name: string,
    role: string,
    university?: string
  ): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      role,
      university,
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  getProfile: async (userId: string) => {
    return apiClient.get(`/users/${userId}`);
  },

  updateProfile: async (userId: string, data: any) => {
    return apiClient.put(`/users/${userId}`, data);
  },

  getCurrentUser: async () => {
    return apiClient.get('/users/me');
  },
};
