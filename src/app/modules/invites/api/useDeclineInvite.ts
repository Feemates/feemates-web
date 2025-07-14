import { useMutation } from '@tanstack/react-query';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface DeclineInviteResponse {
  message: string;
  status: boolean;
}

const declineInviteApi = async (inviteId: number): Promise<DeclineInviteResponse> => {
  const data = await apiClient.post(`/subscription-invites/${inviteId}/decline`);
  return data as unknown as DeclineInviteResponse;
};

export const useDeclineInvite = (onSuccess?: () => void) => {
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (inviteId: number) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return declineInviteApi(inviteId);
    },
    onSuccess: (data: DeclineInviteResponse) => {
      toast.success(data.message || 'Invitation declined successfully.');
      if (onSuccess) onSuccess();
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
