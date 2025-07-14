import { useMutation } from '@tanstack/react-query';
import { apiClient, NetworkError } from '@/lib/api-client';
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
      toast.error(error);
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
