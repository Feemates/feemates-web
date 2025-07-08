import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';

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
  const client = axios.create({ baseURL });

  // Add interceptors
  client.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
  client.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

  return client;
};

export const apiClient = createApiClient(env?.NEXT_PUBLIC_BASE_API_URL || '');
