import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface UpdateSubscriptionPayload {
  name: string;
  description: string;
}

export interface UpdateSubscriptionResponse {
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

const updateSubscriptionApi = async (
  id: string,
  payload: UpdateSubscriptionPayload
): Promise<UpdateSubscriptionResponse> => {
  const data = await apiClient.patch(`/subscriptions/${id}`, payload);
  return data as unknown as UpdateSubscriptionResponse;
};

export const useUpdateSubscription = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (payload: UpdateSubscriptionPayload) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return updateSubscriptionApi(id, payload);
    },
    onSuccess: (data: UpdateSubscriptionResponse) => {
      // Invalidate subscription queries to refetch latest data
      queryClient.invalidateQueries({
        queryKey: ['subscription', id],
      });

      // Show success message
      toast.success(data.message || 'Subscription updated successfully!');

      // Redirect back to subscription details page
      setTimeout(() => {
        router.push(`/subscription/${id}`);
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
