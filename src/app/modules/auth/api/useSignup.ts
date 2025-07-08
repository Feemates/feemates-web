import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_kyc_verified: boolean;
    status: string;
    roles: string[];
  };
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

const signupApi = async (payload: SignupPayload): Promise<SignupResponse> => {
  // The apiClient response interceptor returns response.data directly
  const data = await apiClient.post('/users/register', payload);
  return data as unknown as SignupResponse;
};

export const useSignup = () => {
  const { setToken, setUserId, setUserDetails } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (payload: SignupPayload) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return signupApi(payload);
    },
    onSuccess: (data: SignupResponse) => {
      // Set redirecting state to true to keep loader active
      setIsRedirecting(true);

      // Store tokens and user details
      setToken(data.tokens.access_token, data.tokens.refresh_token);
      setUserId(data.user.id.toString());
      setUserDetails(data?.user || null);

      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);

      // Show success message
      toast.success('Account created successfully! Welcome to Feemates.');
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
