import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface LogoutResponse {
  message: string; // "Logged out successfully"
}

export function useLogout() {
  const router = useRouter();
  const { refreshToken, logout } = useAuthStore();
  return useMutation({
    mutationFn: async () => {
      // Send refresh_token so the backend can revoke it in the DB
      return api.post<LogoutResponse>('/auth/logout', {
        refresh_token: refreshToken,
      });
    },
    onSuccess: () => {
      logout(); // clear user + token + refreshToken from store
      router.push('/login');
    },
    onError: () => {
      // Even if the API call fails (e.g. token already revoked),
      // still clear local state and redirect — never leave user stuck
      logout();
      router.push('/login');
    },
  });
}
