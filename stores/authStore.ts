import { User } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  hasHydrated: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,

      setUser: user => {
        set({ user });
      },

      setToken: token => {
        set({ token });
      },

      logout: () => {
        set({
          user: null,
          token: null,
        });
      },

      checkAuth: () => {
        return !!get().token;
      },

      setHasHydrated: state => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',

      partialize: state => ({
        user: state.user,
        token: state.token,
      }),

      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
