import { apiClient } from '@/lib/api-client';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth-store';

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface ChangePasswordResponse {
  message: string;
}

const changePassword = async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  const { userDetails } = useAuthStore.getState();

  if (!userDetails?.id) {
    throw new Error('User ID not found');
  }

  return apiClient.patch(`/users/${userDetails.id}/change-password`, payload);
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Your password has been changed successfully.');
    },
    onError: (error: AxiosError) => {
      toast.error(error);
    },
  });
};
