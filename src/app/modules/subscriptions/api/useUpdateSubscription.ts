import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';

export interface UpdateSubscriptionPayload {
  name: string;
  description: string;
  thumbnail?: string | null;
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
      toast.error(error);
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
