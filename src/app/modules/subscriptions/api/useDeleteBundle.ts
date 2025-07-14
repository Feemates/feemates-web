import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useMutation } from '@tanstack/react-query';
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
      toast.error(error);
    },
  });
};
