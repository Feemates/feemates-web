import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useMutation } from '@tanstack/react-query';

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
      toast.error(error);
    },
  });

  return {
    ...mutation,
    isOffline,
  };
};
