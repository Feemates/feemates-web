import { apiClient } from '@/lib/api-client';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { AxiosError } from 'axios';

interface UpdateProfilePayload {
  name: string;
  avatar?: string;
}

interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    mobile: string | null;
    is_kyc_verified: boolean;
    google_id: string | null;
    email_verified_at: string | null;
    status: 'active' | 'inactive';
    refresh_token: string | null;
    deletedAt: string | null;
    createdAt: string;
  };
}

const updateProfile = async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  return apiClient.patch('/users/profile', payload);
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
    onError: (error: AxiosError) => {
      toast.error(error);
    },
  });
};
