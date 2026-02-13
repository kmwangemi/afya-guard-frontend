import axios, { AxiosInstance, AxiosError } from "axios";
import { API_BASE_URL, API_TIMEOUT, MOCK_API_ENABLED } from "./constants";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Generic API error handler
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "An error occurred";
    return message;
  }
  return "An unexpected error occurred";
};

// Type-safe API calls
export const api = {
  get: <T,>(url: string, config = {}) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  post: <T,>(url: string, data?: unknown, config = {}) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  put: <T,>(url: string, data?: unknown, config = {}) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  patch: <T,>(url: string, data?: unknown, config = {}) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
  delete: <T,>(url: string, config = {}) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
