import { User } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      hasHydrated: false,

      setUser: user => set({ user }),

      setToken: token => set({ token }),

      setRefreshToken: token => set({ refreshToken: token }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
        }),

      checkAuth: () => !!get().token,

      setHasHydrated: state => set({ hasHydrated: state }),
    }),
    {
      name: 'auth-storage',

      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
