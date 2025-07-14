'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OtpVerificationForm } from '@/app/modules/auth/components/otp-verification-form';
import { useEffect } from 'react';

function OtpVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (!email || !userId) {
      router.replace('/');
    }
  }, [email, userId, router]);

  if (!email || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Invalid Request</h1>
          <p className="mt-2 text-gray-600">Required parameters are missing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <OtpVerificationForm email={email} userId={userId} redirectUrl={redirect} />
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <OtpVerificationContent />
    </Suspense>
  );
}
