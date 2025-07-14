import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RemoveMemberResponse {
  message?: string;
}

interface RemoveMemberVariables {
  subscriptionId: number;
  memberId: number;
}

export const useMemberRemove = () => {
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  return useMutation<RemoveMemberResponse, Error, RemoveMemberVariables>({
    mutationFn: async ({ subscriptionId, memberId }: RemoveMemberVariables) => {
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      const response = await apiClient.patch<RemoveMemberResponse>(
        `/subscriptions/${subscriptionId}/members/${memberId}/remove`
      );
      return response as RemoveMemberResponse;
    },
    onSuccess: (response, variables) => {
      // Invalidate member list query
      queryClient.invalidateQueries({
        queryKey: ['member-list', variables.subscriptionId],
      });
      // Invalidate subscription details query
      queryClient.invalidateQueries({
        queryKey: ['subscription', variables.subscriptionId.toString()],
      });

      toast.success(response?.message || 'Participant removed successfully');
    },
    onError: (error: any) => {
      toast.error(error);
    },
  });
};
