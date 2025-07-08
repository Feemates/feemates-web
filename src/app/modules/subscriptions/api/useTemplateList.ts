import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError } from '@/lib/api-client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface TemplateItem {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  thumbnail_key: string;
  price: number;
}

export interface TemplateMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTemplateListResponse {
  data: TemplateItem[];
  meta: TemplateMeta;
}

export interface GetTemplateListParams {
  page?: number;
  limit?: number;
}

const getTemplateListApi = async (
  params: GetTemplateListParams
): Promise<GetTemplateListResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const data = await apiClient.get(`/subscription-templates?${searchParams.toString()}`);
  return data as unknown as GetTemplateListResponse;
};

export const useTemplateList = (options: { limit?: number } = {}) => {
  const { isOffline } = useNetworkStatus();
  const limit = options.limit || 10;

  return useInfiniteQuery({
    queryKey: ['template-list', limit],
    queryFn: ({ pageParam = 1 }) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return getTemplateListApi({
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
