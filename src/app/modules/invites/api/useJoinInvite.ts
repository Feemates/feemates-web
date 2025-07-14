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
  baseUrl: string;
  successUrl: string;
  cancelUrl: string;
}

const joinInviteApi = async ({
  inviteId,
  successUrl,
  cancelUrl,
}: JoinInviteParams): Promise<JoinInviteResponse> => {
  const data = await apiClient.post(`/subscription-invites/${inviteId}/accept`, {
    successUrl,
    cancelUrl,
  });
  return data as unknown as JoinInviteResponse;
};

export const useJoinInvite = (onSuccess?: () => void) => {
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (params: JoinInviteParams) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return joinInviteApi(params);
    },
    onSuccess: (data: JoinInviteResponse) => {
      if (data.url) {
        window.location.href = data.url;
      } else if (onSuccess) {
        onSuccess();
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
