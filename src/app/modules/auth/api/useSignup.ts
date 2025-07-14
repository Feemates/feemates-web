import { useMutation } from '@tanstack/react-query';
import { apiClient, NetworkError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSearchParams } from 'next/navigation';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_kyc_verified: boolean;
    status: string;
    roles: string[];
    email_verified_at?: string | null;
  };
  tokens?: {
    access_token: string;
    refresh_token: string;
  } | null;
  invited_subscriptions?: number;
  email_verification_required?: boolean;
}

const signupApi = async (payload: SignupPayload): Promise<SignupResponse> => {
  // The apiClient response interceptor returns response.data directly
  const data = await apiClient.post('/users/register', payload);
  return data as unknown as SignupResponse;
};

export const useSignup = () => {
  const { setToken, setUserId, setUserDetails } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOffline } = useNetworkStatus();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: SignupPayload) => {
      timeoutRef.current = setTimeout(() => {
        toast.error('Login is taking longer than usual. Please try again.');
      }, 30000);
      // Check network status before making API call
      if (isOffline) {
        throw new Error(
          'No internet connection. Please check your network and try again.'
        ) as NetworkError;
      }

      try {
        return await signupApi(payload);
      } finally {
        // Always clear timer after API call finishes
        clearTimeout(timeoutRef.current!);
      }
    },
    onSuccess: (data: SignupResponse) => {
      // Set redirecting state to true to keep loader active
      setIsRedirecting(true);

      // Always store user ID and details for OTP verification
      setUserId(data.user.id.toString());
      setUserDetails(data?.user || null);

      // For signup, always redirect to OTP verification page
      const redirectTo = searchParams.get('redirect') || null;
      let otpUrl = `/verify-otp?email=${encodeURIComponent(data.user.email)}&userId=${data.user.id}`;

      // Pass redirect parameter to OTP page if it exists
      if (redirectTo) {
        otpUrl += `&redirect=${encodeURIComponent(redirectTo)}`;
      }

      setTimeout(() => {
        router.push(otpUrl);
      }, 100);

      toast.success(
        data.message ||
          'Account created successfully! Please verify your email with the OTP sent to your inbox.'
      );
    },
    onError: (error: any) => {
      // Reset redirecting state on error
      setIsRedirecting(false);
      clearTimeout(timeoutRef.current!);

      toast.error(error);
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...mutation,
    isPending: mutation.isPending || isRedirecting,
    isRedirecting,
    isOffline,
  };
};
