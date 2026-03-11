import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { LoginRequest, LoginResponse } from '@/types/user';

interface LogoutResponse {
  message: string; // "Logged out successfully"
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response;
  },
  logout: async (): Promise<LogoutResponse> => {
    const { refreshToken } = useAuthStore.getState();
    const response = await api.post<LogoutResponse>('/auth/logout', {
      refresh_token: refreshToken,
    });
    return response;
  },
};
