import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LoginRequest } from "@/types/user";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{
            user: User;
            token: string;
          }>("/auth/login", credentials);

          const { user, token } = response;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          const message = handleApiError(error);
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
        localStorage.setItem("user", JSON.stringify(user));
      },

      setToken: (token: string) => {
        set({ token });
        localStorage.setItem("auth_token", token);
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const token = localStorage.getItem("auth_token");
        const userJson = localStorage.getItem("user");

        if (token && userJson) {
          try {
            const user = JSON.parse(userJson);
            set({
              user,
              token,
              isAuthenticated: true,
            });
            return true;
          } catch {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return false;
          }
        }

        return false;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
