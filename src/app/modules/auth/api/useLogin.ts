import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[];
  };
}

const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  // Extract rememberMe from payload and don't send it to the API
  const { rememberMe, ...apiPayload } = payload;

  // The apiClient response interceptor returns response.data directly
  const data = await apiClient.post('/api/auth/login', apiPayload, {
    headers: {
      'X-App-Type': 'user',
    },
  });
  return data as unknown as LoginResponse;
};

export const useLogin = () => {
  const { setToken, setUserId, setUserDetails, setRememberMe } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data: LoginResponse, variables: LoginPayload) => {
      // Set redirecting state to true to keep loader active
      setIsRedirecting(true);

      // Store tokens, user details, and remember me preference
      setToken(data.access_token, data.refresh_token);
      setUserId(data.user.id.toString());
      setUserDetails(data.user);
      setRememberMe(variables.rememberMe);

      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);

      // Show success message
      toast.success(data.message || 'Login successful! Welcome back.');
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
