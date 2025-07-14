import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';

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
      toast.error(error);
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
