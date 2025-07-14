import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useMutation } from '@tanstack/react-query';

export interface InviteByEmailPayload {
  subscription_id: number;
  emails: string[];
}

export interface InviteByEmailResponse {
  message: string;
  data?: any;
}

const inviteByEmailApi = async (payload: InviteByEmailPayload): Promise<InviteByEmailResponse> => {
  const data = await apiClient.post(
    `/subscription-invites/subscriptions/${payload.subscription_id}/invite`,
    { subscription_id: payload.subscription_id, emails: payload.emails }
  );
  return data as unknown as InviteByEmailResponse;
};

export const useInviteByEmail = () => {
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (payload: InviteByEmailPayload) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return inviteByEmailApi(payload);
    },
    onSuccess: (data: InviteByEmailResponse) => {
      toast.success(data.message || 'Invitations sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to send invitations.');
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
