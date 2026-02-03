import api from '@/lib/api';
import type { User } from '@/types/user';
import type { LoginFormData } from '@/lib/validations';
import type { ApiResponse } from '@/types/common';

export const authService = {
  login: async (credentials: LoginFormData) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials,
    );
    return response.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  refreshToken: async () => {
    const response =
      await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return response.data.data;
  },
};
