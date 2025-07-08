import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';

// Network error types
export const NETWORK_ERROR_TYPES = {
  TIMEOUT: 'NETWORK_TIMEOUT',
  NO_CONNECTION: 'NO_CONNECTION',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type NetworkErrorType = (typeof NETWORK_ERROR_TYPES)[keyof typeof NETWORK_ERROR_TYPES];

export interface NetworkError extends Error {
  type: NetworkErrorType;
  originalError?: any;
}

// Create a custom network error
const createNetworkError = (
  type: NetworkErrorType,
  message: string,
  originalError?: any
): NetworkError => {
  const error = new Error(message) as NetworkError;
  error.type = type;
  error.originalError = originalError;
  return error;
};

// Check if error is a network connectivity issue
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  // Check for axios network errors
  if (error.code === 'NETWORK_ERR' || error.code === 'ERR_NETWORK') return true;
  if (error.message?.includes('Network Error')) return true;
  if (error.message?.includes('ERR_INTERNET_DISCONNECTED')) return true;

  // Check for timeout errors
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;
  if (error.message?.includes('timeout')) return true;

  // Check for connection refused
  if (error.code === 'ECONNREFUSED') return true;

  return false;
};

// Request interceptor function
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (config.headers && typeof window !== 'undefined') {
    const token = useAuthStore.getState().authToken;
    config.headers.authorization = `Bearer ${token || ''}`;
  }
  return config;
};

const requestErrorInterceptor = (error: AxiosError) => {
  return Promise.reject(error);
};

// Response interceptor function
const responseInterceptor = (response: AxiosResponse) => {
  return response.data;
};

// Response error interceptor function
const responseErrorInterceptor = async (error: AxiosError) => {
  // Handle network connectivity errors first
  if (isNetworkError(error)) {
    const networkError = createNetworkError(
      NETWORK_ERROR_TYPES.NO_CONNECTION,
      'No internet connection. Please check your network and try again.',
      error
    );
    return Promise.reject(networkError);
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    const timeoutError = createNetworkError(
      NETWORK_ERROR_TYPES.TIMEOUT,
      'Request timed out. Please check your connection and try again.',
      error
    );
    return Promise.reject(timeoutError);
  }

  if (error.response?.status === 401) {
    const authState = useAuthStore.getState();
    const refreshToken = authState.refreshToken;
    const rememberMe = authState.rememberMe;
    const errorData = error.response?.data as { code?: string; message?: string };
    const message = errorData?.message;

    if (message === 'Unauthorized' && refreshToken) {
      // Check if remember me is enabled

      if (rememberMe) {
        try {
          const response = await axios({
            baseURL: env?.NEXT_PUBLIC_BASE_API_URL,
            url: '/auth/refresh',
            method: 'POST',
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
            timeout: 10000, // 10 second timeout for refresh token request
          });

          const refreshResponse = response.data as unknown as {
            access_token: string;
            refresh_token: string;
          };

          const { access_token: newAccessToken, refresh_token: newRefreshToken } = refreshResponse;
          useAuthStore.getState().setToken(newAccessToken, newRefreshToken);

          if (error.config) {
            error.config.headers['authorization'] = `Bearer ${newAccessToken}`;
            return apiClient(error.config);
          }
        } catch (err) {
          console.error(err);
          useAuthStore.getState().reset();
          toast.error('Session expired. Please login to continue.');
          window.location.href = '/';
        }
      } else {
        // Remember me is false, redirect to login
        useAuthStore.getState().reset();
        toast.error('Session expired. Please login to continue.');
        window.location.href = '/';
      }
    }

    if (message === 'Unauthenticated' || message === 'Unauthorized') {
      useAuthStore.getState().reset();
      toast.error('Please login to continue.');
      window.location.href = '/';
    }
  }
  return Promise.reject(error);
};

// Factory function to create API clients
export const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 15000, // 15 second timeout for all requests
  });

  // Add interceptors
  client.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
  client.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

  return client;
};

export const apiClient = createApiClient(env?.NEXT_PUBLIC_BASE_API_URL || '');
