import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export interface GetDashboardResponse {
  owned_subscriptions: number;
  member_subscriptions: number;
  invited_subscriptions: number;
}

export const getDashboardData = async (): Promise<GetDashboardResponse> => {
  const res = await apiClient.get('/users/dashboard');
  return res.data;
};

export const useGetDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });
};
