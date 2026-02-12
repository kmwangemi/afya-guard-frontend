import api from '@/lib/api';
import type { LoginFormData } from '@/lib/validations';
import type { ApiResponse } from '@/types/common';
import type { User } from '@/types/user';

export const authService = {
  login: async (credentials: LoginFormData) => {
    // Use URLSearchParams for FastAPI OAuth2
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    const response = await api.post<{
      access_token: string;
      token_type: string;
    }>('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  logout: async () => {
    await api.post('/logout');
  },
  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/profile');
    return response.data.data;
  },
  refreshToken: async () => {
    const response = await api.post<ApiResponse<{ token: string }>>('/refresh');
    return response.data.data;
  },
};
