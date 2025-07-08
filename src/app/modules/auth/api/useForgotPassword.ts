import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/toast';

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

const forgotPasswordApi = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  // The apiClient response interceptor returns response.data directly
  const data = await apiClient.post('/api/auth/forgot-password', payload);
  return data as unknown as ForgotPasswordResponse;
};

export const useForgotPassword = () => {
  const mutation = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (data: ForgotPasswordResponse) => {
      // Show success message
      toast.success(data.message || 'A reset link has been sent to your email.');
    },
    onError: (error: any) => {
      // Show error message
      toast.error(error);
    },
  });

  return {
    ...mutation,
  };
};
