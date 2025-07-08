import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export interface GetDashboardResponse {
  owned_subscriptions: number;
  member_subscriptions: number;
  invited_subscriptions: number;
  kyc: {
    id: number;
    status: string;
  } | null;
  is_kyc_verified: boolean;
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
