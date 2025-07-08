import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useRouter } from 'nextjs-toploader/app';

interface DeleteBundleResponse {
  message?: string;
}

interface DeleteBundleVariables {
  subscriptionId: number;
  bundleName: string;
}

export const useDeleteBundle = () => {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  return useMutation<DeleteBundleResponse, Error, DeleteBundleVariables>({
    mutationFn: async ({ subscriptionId, bundleName }: DeleteBundleVariables) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      const response = await apiClient.delete<DeleteBundleResponse>(
        `/subscriptions/${subscriptionId}`,
        { data: { bundle_name: bundleName } }
      );
      return response as DeleteBundleResponse;
    },
    onSuccess: (response) => {
      toast.success(response?.message || 'Bundle deleted successfully');
      router.push('/subscriptions');
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
};
