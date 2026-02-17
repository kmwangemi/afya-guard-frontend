import { User } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: user => {
        set({ user, isAuthenticated: true });
      },

      setToken: token => {
        set({ token });
        // Zustand persist handles this automatically under 'auth-storage'
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Zustand persist clears its own key automatically on state reset
      },

      checkAuth: () => {
        // Read token from Zustand state, not localStorage directly
        return !!get().token;
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
