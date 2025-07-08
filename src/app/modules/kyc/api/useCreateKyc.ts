import { useMutation } from '@tanstack/react-query';
import { apiClient, isNetworkError, NetworkError, NETWORK_ERROR_TYPES } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface CreateKycPayload {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  confirm_account_number: string;
  institution_number: string;
  transit_number: string;
}

export interface CreateKycResponse {
  message: string;
  data: any;
}

const createKycApi = async (payload: CreateKycPayload): Promise<CreateKycResponse> => {
  const data = await apiClient.post('/user-kyc', payload);
  return data as unknown as CreateKycResponse;
};

export const useCreateKyc = () => {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  const mutation = useMutation({
    mutationFn: async (payload: CreateKycPayload) => {
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }
      return createKycApi(payload);
    },
    onSuccess: (data: CreateKycResponse) => {
      toast.success(data.message || 'KYC submitted successfully!');
      // You can add navigation or other logic here if needed
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

  return {
    ...mutation,
    isOffline,
  };
};
