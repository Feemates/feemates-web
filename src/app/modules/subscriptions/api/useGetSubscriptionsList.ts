import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface SubscriptionOwner {
  id: number;
  name: string;
  email: string;
}

export interface SubscriptionItem {
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
  owner: SubscriptionOwner;
  is_owner: boolean;
}

export interface SubscriptionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetSubscriptionsResponse {
  data: SubscriptionItem[];
  meta: SubscriptionMeta;
}

export interface GetSubscriptionsParams {
  page?: number;
  limit?: number;
  own_subscription?: boolean;
  name?: string;
}

const getSubscriptionsApi = async (
  params: GetSubscriptionsParams
): Promise<GetSubscriptionsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.own_subscription !== undefined)
    searchParams.append('own_subscription', params.own_subscription.toString());
  if (params.name) searchParams.append('name', params.name);

  const data = await apiClient.get(`/subscriptions?${searchParams.toString()}`);
  return data as unknown as GetSubscriptionsResponse;
};

export const useGetSubscriptionsList = (params: Omit<GetSubscriptionsParams, 'page'> = {}) => {
  const { isOffline } = useNetworkStatus();
  const limit = params.limit || 10;

  const query = useInfiniteQuery({
    queryKey: ['subscriptions-list', params],
    queryFn: ({ pageParam = 1 }) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }

      return getSubscriptionsApi({
        ...params,
        page: pageParam,
        limit,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    retry: (failureCount, error) => {
      // Don't retry on network errors
      if (isNetworkError(error) || (error as NetworkError)?.type) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle errors separately
  if (query.error) {
    const error = query.error;
    // Error handling will be done in the component
  }

  return query;
};
