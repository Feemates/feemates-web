'use client';

import { useGetMe } from '@/api/get-user';
import { useAuthStore } from '@/store/auth-store';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function ProtectedRoutesWrapper({
  children,
  isProtectedRoute,
}: {
  children: React.ReactNode;
  isProtectedRoute: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const { authToken, userDetails } = useAuthStore();

  useGetMe(authToken);

  useEffect(() => {
    if (!isProtectedRoute) {
      if (authToken) {
        // Check if user has completed OTP verification
        // if (userDetails && !userDetails.email_verified_at) {
        //   router.replace(`/verify-otp?email=${encodeURIComponent(userDetails.email)}`);
        // } else {
        router.replace('/dashboard');
        // }
      } else {
        setIsLoading(false);
      }
    }
  }, [authToken, userDetails, router, isProtectedRoute]);

  useEffect(() => {
    if (isProtectedRoute) {
      if (!authToken) {
        const currentUrl =
          pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        const loginUrl = `/?redirect=${encodeURIComponent(currentUrl)}`;
        router.replace(loginUrl);
      }
      // else if (userDetails && !userDetails.is_otp_verified) {
      //   router.replace(`/verify-otp?email=${encodeURIComponent(userDetails.email)}`);
      // }
      else {
        setIsLoading(false);
      }
    }
  }, [authToken, userDetails, router, isProtectedRoute, pathname, searchParams]);

  if (isLoading) {
    return <div className="min-h-screen animate-pulse bg-white"></div>;
  }

  return <>{children}</>;
}

export default ProtectedRoutesWrapper;
