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
  };
  tokens: {
    access_token: string;
    refresh_token: string;
  };
  invited_subscriptions?: number;
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

      // Store tokens and user details
      setToken(data.tokens.access_token, data.tokens.refresh_token);
      setUserId(data.user.id.toString());
      setUserDetails(data?.user || null);

      const redirectTo = searchParams.get('redirect') || null;

      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        try {
          if (redirectTo) {
            // Use decodeURIComponent to handle encoded URLs properly
            const decodedRedirectTo = decodeURIComponent(redirectTo);
            // Prefetch the redirect page to avoid chunk loading issues
            router.prefetch(decodedRedirectTo);
            router.replace(decodedRedirectTo);
          } else if (data.invited_subscriptions && data.invited_subscriptions > 0) {
            router.push('/invites');
          } else {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Redirect error:', error);
          // Fallback to dashboard if redirect fails
          router.push('/dashboard');
        }
      }, 100);

      // Show success message
      toast.success('Account created successfully! Welcome to Feemates.');
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
