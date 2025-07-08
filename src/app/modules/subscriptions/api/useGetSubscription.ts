import { useQuery } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface SubscriptionData {
  id: number;
  name: string;
  description: string;
  status: string;
  price: number;
  per_person_price: number;
  owner_share: number;
  max_no_of_participants: number;
  members_count: number;
  created_by: number;
  startDate: string;
  endDate: string;
  deletedAt: string | null;
  createdAt: string;
  is_owner: boolean;
  member: {
    next_due_date: string;
  };
  owner: {
    id: number;
    name: string;
    email: string;
  };
}

export interface GetSubscriptionResponse {
  status: boolean;
  message: string;
  data: SubscriptionData;
}

const getSubscriptionApi = async (id: string): Promise<GetSubscriptionResponse> => {
  const data = await apiClient.get(`/subscriptions/${id}`);
  return data as unknown as GetSubscriptionResponse;
};

export const useGetSubscription = (id: string) => {
  const { isOffline } = useNetworkStatus();

  const query = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return getSubscriptionApi(id);
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry on network errors
      if (isNetworkError(error) || (error as NetworkError)?.type) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle errors using useEffect-like pattern
  if (query.error) {
    const error = query.error;
    if (isNetworkError(error) || (error as NetworkError)?.type) {
      const networkError = error as NetworkError;
      switch (networkError.type) {
        case NETWORK_ERROR_TYPES.NO_CONNECTION:
          // Error will be handled by the component
          break;
        case NETWORK_ERROR_TYPES.TIMEOUT:
          // Error will be handled by the component
          break;
        default:
          // Error will be handled by the component
          break;
      }
    }
  }

  return query;
};
