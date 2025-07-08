import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';

export interface ResetPasswordPayload {
  token: string;
  user_id: number;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

const resetPasswordApi = async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
  // The apiClient response interceptor returns response.data directly
  const data = await apiClient.post('/auth/reset-password', payload, {
    headers: {
      'X-App-Type': 'user',
    },
  });
  return data as unknown as ResetPasswordResponse;
};

export const useResetPassword = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (data: ResetPasswordResponse) => {
      // Set redirecting state to true to keep loader active
      setIsRedirecting(true);

      // Show success message
      toast.success(data.message || 'Password reset successfully!');

      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        router.push('/');
      }, 2000);
    },
    onError: (error: any) => {
      // Reset redirecting state on error
      setIsRedirecting(false);
      // Show error message
      toast.error(error);
    },
  });

  return {
    ...mutation,
    isPending: mutation.isPending || isRedirecting,
    isRedirecting,
  };
};
