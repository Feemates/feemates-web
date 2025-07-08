import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[];
    is_kyc_verified: boolean;
    status: string;
  };
  invited_subscriptions?: number;
}

const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  // Extract rememberMe from payload and don't send it to the API
  const { rememberMe, ...apiPayload } = payload;

  // The apiClient response interceptor returns response.data directly
  const data = await apiClient.post('/auth/login', apiPayload, {
    headers: {
      'X-App-Type': 'user',
    },
  });
  return data as unknown as LoginResponse;
};

export const useLogin = () => {
  const { setToken, setUserId, setUserDetails, setRememberMe } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return loginApi(payload);
    },
    onSuccess: (data: LoginResponse, variables: LoginPayload) => {
      // Set redirecting state to true to keep loader active
      setIsRedirecting(true);

      // Store tokens, user details, and remember me preference
      setToken(data.access_token, data.refresh_token);
      setUserId(data.user.id.toString());
      setUserDetails(data.user);
      setRememberMe(variables.rememberMe);

      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        if (data.invited_subscriptions && data.invited_subscriptions > 0) {
          router.push('/invites');
        } else {
          router.push('/dashboard');
        }
      }, 100);

      // Show success message
      toast.success(data.message || 'Login successful! Welcome back.');
    },
    onError: (error: any) => {
      // Reset redirecting state on error
      setIsRedirecting(false);

      // Handle different types of errors
      if (isNetworkError(error) || (error as NetworkError)?.type) {
        const networkError = error as NetworkError;
        switch (networkError.type) {
          case NETWORK_ERROR_TYPES.NO_CONNECTION:
            toast.error('No internet connection. Please check your network and try again.');
            break;
          case NETWORK_ERROR_TYPES.TIMEOUT:
            toast.error('Request timed out. Please check your connection and try again.');
            break;
          default:
            toast.error('Network error occurred. Please try again.');
        }
      } else if (error.message?.includes('No internet connection')) {
        toast.error('No internet connection. Please check your network and try again.');
      } else {
        // Show original error message for other types of errors
        toast.error(error);
      }
    },
  });

  return {
    ...mutation,
    isPending: mutation.isPending || isRedirecting,
    isRedirecting,
    isOffline,
  };
};
