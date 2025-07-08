import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useRouter } from 'nextjs-toploader/app';

interface OnboardUrlResponse {
  status: boolean;
  message: string;
  data: {
    redirect: {
      object: string;
      created: number;
      expires_at: number;
      url: string;
    };
    return_url: string;
  };
}

const generateOnboardUrlApi = async (): Promise<OnboardUrlResponse> => {
  const dashboardUrl = `${window.location.origin}/dashboard`;
  const response = await apiClient.post<never, OnboardUrlResponse>(
    '/user-kyc/stripe/generate-onboard-url',
    {
      return_url: dashboardUrl,
    }
  );
  return response;
};

export const useGenerateOnboardUrl = () => {
  const { isOffline } = useNetworkStatus();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return generateOnboardUrlApi();
    },
    onSuccess: (data: OnboardUrlResponse) => {
      if (data.status && data.data.redirect.url) {
        // Show success message

        // Redirect to Stripe onboard URL
        setTimeout(() => {
          // window.location.href = data.data.redirect.url;
          router.push(data.data.redirect.url);
        }, 100);
      }
    },
    onError: (error: any) => {
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
    isOffline,
  };
};
