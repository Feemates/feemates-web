import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError } from '@/lib/api-client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface InviteItem {
  subscription_id: number;
  subscription_name: string;
  members_count: number;
  max_members_count: number;
  owner_name: string;
  price: number;
  status: string;
  createdAt: string;
  joinedAt: string | null;
  id: number;
}

export interface InviteListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetInviteListResponse {
  status: boolean;
  message: string;
  data: InviteItem[];
  meta?: InviteListMeta;
}

export interface GetInviteListParams {
  page?: number;
  limit?: number;
}

const getInviteListApi = async (params: GetInviteListParams): Promise<GetInviteListResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const data = await apiClient.get(`/subscription-invites?${searchParams.toString()}`);
  return data as unknown as GetInviteListResponse;
};

export const useInviteList = (params: Omit<GetInviteListParams, 'page'> = {}) => {
  const { isOffline } = useNetworkStatus();
  const limit = params.limit || 10;

  const query = useInfiniteQuery({
    queryKey: ['invite-list', params],
    queryFn: ({ pageParam = 1 }) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return getInviteListApi({
        ...params,
        page: pageParam,
        limit,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    retry: (failureCount, error) => {
      if (isNetworkError(error) || (error as NetworkError)?.type) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return query;
};
