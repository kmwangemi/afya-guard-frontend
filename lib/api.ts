import { useAuthStore } from '@/stores/authStore';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './constants';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Silent token refresh on 401 ───────────────────────────────────────────────
// Flow:
//   1. Request fails with 401
//   2. Try to get a new access_token using the stored refresh_token
//   3. On success → save new token + retry the original request transparently
//   4. On failure (refresh_token revoked/expired) → logout + redirect /login
//
// The isRefreshing flag + failedQueue ensure that if multiple requests fail
// simultaneously, only ONE refresh call is made and all others wait for it.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    const { refreshToken, setToken, logout } = useAuthStore.getState();
    // No refresh token — log out immediately
    if (!refreshToken) {
      logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    }
    // Another refresh is already running — queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest!.headers!.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest!);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{
        access_token: string;
        token_type: string;
        expires_in: number;
      }>(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      setToken(data.access_token);
      originalRequest!.headers!.Authorization = `Bearer ${data.access_token}`;
      processQueue(null, data.access_token);
      return apiClient(originalRequest!);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Generic error message extractor ──────────────────────────────────────────
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const message =
      data?.detail ||
      data?.error?.message ||
      data?.message ||
      error.message ||
      'An error occurred';
    if (Array.isArray(message)) {
      return message.map((err: { msg: string }) => err.msg).join(', ');
    }
    return message;
  }
  return 'An unexpected error occurred';
};

// ── Type-safe API helpers ─────────────────────────────────────────────────────
export const api = {
  get: <T>(url: string, config = {}) =>
    apiClient.get<T>(url, config).then(res => res.data),
  post: <T>(url: string, data?: unknown, config = {}) =>
    apiClient.post<T>(url, data, config).then(res => res.data),
  put: <T>(url: string, data?: unknown, config = {}) =>
    apiClient.put<T>(url, data, config).then(res => res.data),
  patch: <T>(url: string, data?: unknown, config = {}) =>
    apiClient.patch<T>(url, data, config).then(res => res.data),
  delete: <T>(url: string, config = {}) =>
    apiClient.delete<T>(url, config).then(res => res.data),
};

export default apiClient;
