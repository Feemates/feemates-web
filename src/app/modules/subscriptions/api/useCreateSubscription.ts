import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface CreateSubscriptionPayload {
  name: string;
  description: string;
  status: 'active';
  price: number;
  max_no_of_participants: number;
  startDate: string;
  endDate: string;
}

export interface CreateSubscriptionResponse {
  message: string;
  data: {
    id: number;
    name: string;
    description: string;
    status: string;
    price: number;
    per_person_price: number;
    max_no_of_participants: number;
    startDate: string;
    endDate: string;
  };
}

const createSubscriptionApi = async (
  payload: CreateSubscriptionPayload
): Promise<CreateSubscriptionResponse> => {
  const data = await apiClient.post('/subscriptions', payload);
  return data as unknown as CreateSubscriptionResponse;
};

export const useCreateSubscription = () => {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (payload: CreateSubscriptionPayload) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return createSubscriptionApi(payload);
    },
    onSuccess: (data: CreateSubscriptionResponse) => {
      // Show success message
      toast.success(data.message || 'Subscription created successfully!');

      // Redirect to subscription created page with the ID
      setTimeout(() => {
        router.push(`/subscription-created/${data.data.id}`);
      }, 100);
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
