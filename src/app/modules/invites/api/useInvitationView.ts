import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

type SubscriptionResponse = {
  status: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    description: string;
    thumbnail: string;
    status: string;
    price: number;
    per_person_price: number;
    owner_share: number;
    max_no_of_participants: number;
    members_count: number;
    created_by: number;
    startDate: string; // ISO Date string
    endDate: string; // ISO Date string
    stripe_plan_id: string;
    stripe_plan__price_id: string;
    deletedAt: string | null;
    createdAt: string; // ISO Date string
    owner: {
      name: string;
    };
    is_owner: boolean;
    member: {
      id: number;
      status: string;
      createdAt: string; // ISO Date string
      joined_at: string; // ISO Date string
      price: number;
    };
    subscription_invite_id: number;
  } | null;
};

export const getInvitationView = async (
  subscriptionId: number,
  token?: string | null
): Promise<SubscriptionResponse> => {
  const res = await apiClient.get(
    `/subscription-invites/subscriptions/${subscriptionId}/validate`,
    {
      params: token ? { token } : {},
    }
  );
  return res as unknown as SubscriptionResponse;
};

export const useInvitationView = (subscriptionId: number, token?: string | null) => {
  return useQuery({
    queryKey: ['invitation-view', subscriptionId, token],
    queryFn: () => getInvitationView(subscriptionId, token),
  });
};
