'use client';

import type { LoginFormData } from '@/lib/validations';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    setLoading,
    logout: storeLogout,
    hydrate,
  } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      const { access_token } = await authService.login(credentials);
      return { token: access_token };
    },
    onSuccess: ({ token }) => {
      setToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
      router.push('/dashboard'); // Uncommented!
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      storeLogout();
      router.push('/login');
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      return await authService.getProfile();
    },
    enabled: !!token && !user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync, // Add this for error handling
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error, // Add this!
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    profileError: profileQuery.error,
  };
}
