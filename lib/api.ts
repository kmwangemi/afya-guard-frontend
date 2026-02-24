import { useAuthStore } from '@/stores/authStore';
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './constants';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("auth_token");
//         localStorage.removeItem("user");
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// Generic API error handler
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const message =
      data?.detail || // FastAPI errors  e.g. { detail: "Invalid email or password" }
      data?.error?.message || // nested error object
      data?.message || // flat message field
      error.message || // axios network-level error
      'An error occurred';
    // FastAPI validation errors return detail as an array e.g.
    // { detail: [{ loc: [...], msg: "...", type: "..." }] }
    if (Array.isArray(message)) {
      return message.map(err => err.msg).join(', ');
    }
    return message;
  }
  return 'An unexpected error occurred';
};

// Type-safe API calls
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
