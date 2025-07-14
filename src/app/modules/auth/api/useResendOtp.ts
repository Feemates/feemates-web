import { useMutation } from '@tanstack/react-query';
import { apiClient, NetworkError } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface ResendOtpPayload {
  userId: string;
}

export interface ResendOtpResponse {
  message: string;
}

const resendOtpApi = async (payload: ResendOtpPayload): Promise<ResendOtpResponse> => {
  const data = await apiClient.post(`/users/${payload.userId}/resend-verification`);
  return data as unknown as ResendOtpResponse;
};

export const useResendOtp = () => {
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (payload: ResendOtpPayload) => {
      if (isOffline) {
        throw new Error(
          'Connection failed. Please check your network and try again.'
        ) as NetworkError;
      }

      return await resendOtpApi(payload);
    },
    onSuccess: (data: ResendOtpResponse) => {
      toast.success(data.message || 'OTP sent successfully!');
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
