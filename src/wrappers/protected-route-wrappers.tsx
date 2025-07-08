'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function ProtectedRoutesWrapper({
  children,
  isProtectedRoute,
}: {
  children: React.ReactNode;
  isProtectedRoute: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const authToken = useAuthStore.getState().authToken;

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
        router.replace('/');
      } else {
        setIsLoading(false);
      }
    }
  }, [authToken, router, isProtectedRoute]);

  if (isLoading) {
    return <div className="min-h-screen animate-pulse bg-white"></div>;
  }

  return <>{children}</>;
}

export default ProtectedRoutesWrapper;
