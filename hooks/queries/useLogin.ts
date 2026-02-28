import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { LoginRequest, LoginResponse } from '@/types/user';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const router = useRouter();
  const { setUser, setToken, setRefreshToken } = useAuthStore();
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      return api.post<LoginResponse>('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    },
    onSuccess: data => {
      setUser(data.user);
      setToken(data.tokens.access_token);
      setRefreshToken(data.tokens.refresh_token); // store for silent refresh + logout
      router.push('/dashboard');
    },
  });
}
