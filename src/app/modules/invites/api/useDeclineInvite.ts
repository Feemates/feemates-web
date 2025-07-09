import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
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
