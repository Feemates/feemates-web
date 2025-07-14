import { useMutation } from '@tanstack/react-query';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface JoinInviteResponse {
  message: string;
  status: boolean;
  url?: string;
}

interface JoinInviteParams {
  inviteId: number;
  subscriptionId: number;
  baseUrl: string;
  successUrl: string;
  cancelUrl: string;
}

const acceptInvite = async ({
  subscriptionId,
  inviteId,
  successUrl,
  cancelUrl,
}: JoinInviteParams): Promise<JoinInviteResponse> => {
  const data = await apiClient.post(
    `/subscription-invites/subscriptions/${subscriptionId}/accept`,
    {
      successUrl,
      cancelUrl,
      subscription_invite_id: inviteId,
    }
  );
  return data as unknown as JoinInviteResponse;
};

export const useInvitationAccept = () => {
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (params: JoinInviteParams) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return acceptInvite(params);
    },
    onSuccess: (data: JoinInviteResponse) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error);
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
