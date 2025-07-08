import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface RemoveMemberVariables {
  subscriptionId: number;
  memberId: number;
}

export const useMemberRemove = () => {
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  return useMutation({
    mutationFn: async ({ subscriptionId, memberId }: RemoveMemberVariables) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      const response = await apiClient.patch(
        `/subscriptions/${subscriptionId}/members/${memberId}/remove`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate member list query
      queryClient.invalidateQueries({
        queryKey: ['member-list', variables.subscriptionId],
      });
      // Invalidate subscription details query
      queryClient.invalidateQueries({
        queryKey: ['subscription', variables.subscriptionId.toString()],
      });

      // Show success message
      toast.success(data.message || 'Participant removed successfully');
    },
    onError: (error: any) => {
      // Handle different types of errors
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
        // Show original error message for other types of errors
        toast.error(error);
      }
    },
  });
};
