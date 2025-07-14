'use client';
import { useState } from 'react';
import { OtpVerificationForm } from '@/app/modules/auth/components/otp-verification-form';

export default function TestOtpPage() {
  const [email] = useState('test@example.com');
  const [userId] = useState('1');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">OTP Test Page</h1>
          <p className="text-gray-600">This is a test page for the OTP verification component</p>
        </div>
        <OtpVerificationForm email={email} userId={userId} redirectUrl={null} />
      </div>
    </div>
  );
}
