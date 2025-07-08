import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string | null;
  mobile: string | null;
  is_kyc_verified: boolean;
  avatar: string | null;
  google_id: string | null;
  email_verified_at: string | null;
  status: 'active' | 'inactive';
  refresh_token: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface GetUserResponse {
  message: string;
  user: User;
}

const getMe = (): Promise<GetUserResponse> => {
  return apiClient.get('/auth/me');
};

export const useGetMe = () => {
  const { setUserDetails } = useAuthStore();

  const query = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  // Store user details in auth store when data is successfully fetched
  useEffect(() => {
    if (query.data?.user) {
      setUserDetails(query.data.user);
    }
  }, [query.data, setUserDetails]);

  return query;
};
