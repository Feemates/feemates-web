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
  const authToken = useAuthStore.getState().authToken;

  useGetMe(authToken);

  useEffect(() => {
    if (!isProtectedRoute) {
      if (authToken) {
        router.replace('/dashboard');
      } else {
        setIsLoading(false);
      }
    }
  }, [authToken, router, isProtectedRoute]);

  useEffect(() => {
    if (isProtectedRoute) {
      if (!authToken) {
        const currentUrl =
          pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        const loginUrl = `/?redirect=${encodeURIComponent(currentUrl)}`;
        router.replace(loginUrl);
      } else {
        setIsLoading(false);
      }
    }
  }, [authToken, router, isProtectedRoute, pathname, searchParams]);

  if (isLoading) {
    return <div className="min-h-screen animate-pulse bg-white"></div>;
  }

  return <>{children}</>;
}

export default ProtectedRoutesWrapper;
