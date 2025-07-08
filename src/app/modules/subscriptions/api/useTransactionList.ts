import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError } from '@/lib/api-client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface TransactionUser {
  id: number;
  name: string;
}

export interface TransactionItem {
  id: number;
  user_id: number;
  subscription_id: number;
  subscription_user_id: number;
  payment_date: string;
  amount: number;
  status: string;
  session_id: string;
  deletedAt: string | null;
  createdAt: string;
  user: TransactionUser;
}

export interface TransactionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTransactionListResponse {
  data: TransactionItem[];
  meta: TransactionMeta;
}

export interface GetTransactionListParams {
  subscriptionId: number;
  page?: number;
  limit?: number;
}

const getTransactionListApi = async (
  params: GetTransactionListParams
): Promise<GetTransactionListResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const data = await apiClient.get(
    `/subscriptions/${params.subscriptionId}/transactions?${searchParams.toString()}`
  );
  return data as unknown as GetTransactionListResponse;
};

export const useTransactionList = (subscriptionId: number, options: { limit?: number } = {}) => {
  const { isOffline } = useNetworkStatus();
  const limit = options?.limit || 10;

  return useInfiniteQuery({
    queryKey: ['transaction-list', subscriptionId, limit],
    queryFn: ({ pageParam = 1 }) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return getTransactionListApi({
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
