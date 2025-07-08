import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export interface BankDetailsResponse {
  message: string;
  is_user_kyc_exists: boolean;
  data: {
    id: number;
    user_id: number;
    account_holder_name: string;
    bank_name: string;
    ifsc_code: string | null;
    ifsc_code_iv: string | null;
    account_number: string;
    account_number_iv: string;
    status: string;
    transit_number: string;
    institution_number: string;
    note: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export const getBankDetails = async (): Promise<any> => {
  const res = await apiClient.get('/user-kyc/my-kyc');
  return res;
};

export const useGetBankDetails = () => {
  return useQuery({
    queryKey: ['bank-details'],
    queryFn: getBankDetails,
  });
};
