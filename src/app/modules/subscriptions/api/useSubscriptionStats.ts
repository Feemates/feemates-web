import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type SubscriptionStats = {
  firstDay: string;
  lastDay: string;
  total_paid: number;
  savings: number;
};

const getSubscriptionStats = async (id: string): Promise<SubscriptionStats> => {
  const data = await apiClient.get<SubscriptionStats>(`/subscriptions/${id}/stats`);
  return data as unknown as SubscriptionStats;
};

export const useSubscriptionStats = (id: string, owner?: boolean) => {
  return useQuery({
    queryKey: ['subscription-stats', id, owner],
    queryFn: () => getSubscriptionStats(id),
    enabled: !!id && owner,
  });
};
