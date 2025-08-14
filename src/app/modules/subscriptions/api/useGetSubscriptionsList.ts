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
  thumbnail: string;
  owner: SubscriptionOwner;
  is_owner: boolean;
  member: {
    status: string;
  };
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
  name?: string;
  type?: 'owner' | 'member' | 'all';
  status?: 'active' | 'expired' | 'all';
  sortBy?: 'name' | 'createdAt' | 'per_person_price';
  sortOrder?: 'asc' | 'desc';
}

const getSubscriptionsApi = async (
  params: GetSubscriptionsParams
): Promise<GetSubscriptionsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.name) searchParams.append('name', params.name);
  if (params.status && params.status !== 'all') searchParams.append('status', params.status);
  searchParams.append('type', params.type ?? 'all');
  searchParams.append('sortBy', params.sortBy ?? 'createdAt');
  searchParams.append('sortOrder', params.sortOrder ?? 'asc');

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
  });

  // Handle errors separately
  if (query.error) {
    const error = query.error;
    // Error handling will be done in the component
  }

  return query;
};
