// app/not-found.tsx
'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const authToken = useAuthStore.getState().authToken;

  useEffect(() => {
    if (authToken) {
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  }, [authToken, router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
