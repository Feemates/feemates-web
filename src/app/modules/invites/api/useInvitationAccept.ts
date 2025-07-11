import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useRouter } from 'nextjs-toploader/app';

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
      if (isNetworkError(error) || (error as NetworkError)?.type) {
        const networkError = error as NetworkError;
        switch (networkError.type) {
          case NETWORK_ERROR_TYPES.NO_CONNECTION:
            toast.error('No internet connection. Please check your network and try again.');
            break;
          case NETWORK_ERROR_TYPES.TIMEOUT:
            toast.error('Request timed out. Please check your connection and try again.');
            break;
          default:
            toast.error('Network error occurred. Please try again.');
        }
      } else if (error.message?.includes('No internet connection')) {
        toast.error('No internet connection. Please check your network and try again.');
      } else {
        toast.error(error);
      }
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
