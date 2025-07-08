import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError } from '@/lib/api-client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface MemberUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

export interface MemberItem {
  id: number;
  user_id: number;
  subscription_id: number;
  invited_email: string;
  status: string;
  user_type: string;
  payment_status: string;
  price: number;
  joined_at: string | null;
  createdAt: string;
  user: MemberUser;
}

export interface MemberMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetMemberListResponse {
  data: MemberItem[];
  meta: MemberMeta;
}

export interface GetMemberListParams {
  subscriptionId: number;
  page?: number;
  limit?: number;
}

const getMemberListApi = async (params: GetMemberListParams): Promise<GetMemberListResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const data = await apiClient.get(
    `/subscriptions/${params.subscriptionId}/members?${searchParams.toString()}`
  );
  return data as unknown as GetMemberListResponse;
};

export const useMemberList = (subscriptionId: number, options: { limit?: number } = {}) => {
  const { isOffline } = useNetworkStatus();
  const limit = options.limit || 10;

  return useInfiniteQuery({
    queryKey: ['member-list', subscriptionId, limit],
    queryFn: ({ pageParam = 1 }) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return getMemberListApi({
        subscriptionId,
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
      if (isNetworkError(error) || (error as NetworkError)?.type) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
