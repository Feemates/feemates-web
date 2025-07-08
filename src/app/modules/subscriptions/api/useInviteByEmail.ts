import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

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
        toast.error(error?.message || 'Failed to send invitations.');
      }
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
