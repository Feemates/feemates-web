import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useQuery } from '@tanstack/react-query';

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
  thumbnail?: string;
  member: {
    next_due_date: string;
    user_id: number;
    id: number;
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
  });

  // Handle errors using useEffect-like pattern
  if (query.error) {
    toast.error(query.error);
  }

  return query;
};
