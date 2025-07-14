import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';

interface LeaveBundleResponse {
  message?: string;
}

interface LeaveBundleVariables {
  subscriptionId: number;
  memberId: number;
}

export const useLeaveBundle = () => {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  return useMutation<LeaveBundleResponse, Error, LeaveBundleVariables>({
    mutationFn: async ({ subscriptionId, memberId }: LeaveBundleVariables) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      const response = await apiClient.patch<LeaveBundleResponse>(
        `/subscriptions/${subscriptionId}/members/${memberId}/leave`
      );
      return response as LeaveBundleResponse;
    },
    onSuccess: (response) => {
      toast.success(response?.message || 'You have left the subscription');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error);
    },
  });
};
