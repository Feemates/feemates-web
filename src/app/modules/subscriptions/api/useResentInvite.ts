import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface ResentInviteResponse {
  message: string;
}

const resentInviteApi = async (id: number): Promise<ResentInviteResponse> => {
  const data = await apiClient.post(`/subscription-invites/${id}/resend-invite`);
  return data as unknown as ResentInviteResponse;
};

export const useResentInvite = () => {
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return resentInviteApi(id);
    },
    onSuccess: (data: ResentInviteResponse) => {
      toast.success(data.message || 'Invite resent successfully!');
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
