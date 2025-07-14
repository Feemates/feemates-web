import { useMutation } from '@tanstack/react-query';
import { apiClient, NetworkError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSearchParams } from 'next/navigation';

export interface VerifyOtpPayload {
  userId: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[];
    is_kyc_verified: boolean;
    is_otp_verified: boolean;
    status: string;
  };
  invited_subscriptions?: number;
}

const verifyOtpApi = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
  const data = await apiClient.post(
    `/users/${payload.userId}/verify-email`,
    {
      otp: payload.otp,
    },
    {
      headers: {
        'X-App-Type': 'user',
      },
    }
  );
  return data as unknown as VerifyOtpResponse;
};

export const useVerifyOtp = () => {
  const { setToken, setUserId, setUserDetails } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOffline } = useNetworkStatus();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      timeoutRef.current = setTimeout(() => {
        toast.error('OTP verification is taking longer than usual. Please try again.');
      }, 30000);

      if (isOffline) {
        throw new Error(
          'Connection failed. Please check your network and try again.'
        ) as NetworkError;
      }

      try {
        return await verifyOtpApi(payload);
      } finally {
        clearTimeout(timeoutRef.current!);
      }
    },
    onSuccess: (data: VerifyOtpResponse) => {
      setIsRedirecting(true);

      // Store tokens and user details
      setToken(data.access_token, data.refresh_token);
      setUserId(data.user.id.toString());
      setUserDetails(data.user);

      const redirectTo = searchParams.get('redirect') || null;

      setTimeout(() => {
        try {
          // First check if there's a redirect URL from OTP verification page
          const otpRedirect = new URLSearchParams(window.location.search).get('redirect');

          if (otpRedirect) {
            const decodedRedirectTo = decodeURIComponent(otpRedirect);
            router.prefetch(decodedRedirectTo);
            router.replace(decodedRedirectTo);
          } else if (redirectTo) {
            const decodedRedirectTo = decodeURIComponent(redirectTo);
            router.prefetch(decodedRedirectTo);
            router.replace(decodedRedirectTo);
          } else if (data.invited_subscriptions && data.invited_subscriptions > 0) {
            router.push('/invites');
          } else {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Redirect error:', error);
          router.push('/dashboard');
        }
      }, 100);

      toast.success(data.message || 'OTP verified successfully! Welcome to Feemates.');
    },
    onError: (error: any) => {
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
