import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const router = useRouter();
  const { setUser, setToken, setRefreshToken } = useAuthStore();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: data => {
      setUser(data.user);
      setToken(data.tokens.access_token);
      setRefreshToken(data.tokens.refresh_token); // store for silent refresh + logout
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  return useMutation({
    mutationFn: authService.logout,
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
