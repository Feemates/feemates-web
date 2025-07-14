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
  const [hasHydrated, setHasHydrated] = useState(false);
  const { authToken } = useAuthStore();

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useGetMe(authToken);

  useEffect(() => {
    // Don't make routing decisions until the store has hydrated
    if (!hasHydrated) return;

    if (!isProtectedRoute) {
      if (authToken) {
        router.replace('/dashboard');
      } else {
        setIsLoading(false);
      }
    }
  }, [authToken, router, isProtectedRoute, hasHydrated]);

  useEffect(() => {
    // Don't make routing decisions until the store has hydrated
    if (!hasHydrated) return;

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
  }, [authToken, router, isProtectedRoute, pathname, searchParams, hasHydrated]);

  if (isLoading) {
    return <div className="min-h-screen animate-pulse bg-white"></div>;
  }

  return <>{children}</>;
}

export default ProtectedRoutesWrapper;
