'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Home, XCircle } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';

export const PaymentFailed = () => {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Trigger animations in sequence
    const timer1 = setTimeout(() => setAnimationStep(1), 300);
    const timer2 = setTimeout(() => setAnimationStep(2), 800);
    const timer3 = setTimeout(() => setAnimationStep(3), 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 h-24 w-24 animate-pulse rounded-full bg-red-200 opacity-20"></div>
        <div className="absolute top-1/4 -right-8 h-32 w-32 animate-bounce rounded-full bg-orange-200 opacity-15"></div>
        <div className="absolute bottom-1/4 -left-6 h-20 w-20 animate-pulse rounded-full bg-yellow-200 opacity-25 delay-1000"></div>
        <div className="absolute right-1/4 -bottom-8 h-28 w-28 animate-bounce rounded-full bg-red-300 opacity-10 delay-500"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Failed Icon with Animation */}
          <div className="text-center">
            <div
              className={`mb-8 inline-flex h-32 w-32 items-center justify-center rounded-full bg-red-100 transition-all duration-1000 ${
                animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <div
                className={`transition-all delay-300 duration-500 ${
                  animationStep >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                }`}
              >
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            <div
              className={`transition-all delay-500 duration-700 ${
                animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h1 className="mb-4 text-4xl font-bold text-gray-900">Payment Failed</h1>
              <p className="mb-8 text-xl text-gray-600">We couldn't process your payment</p>
            </div>
          </div>

          {/* Error Message Card */}
          <Card
            className={`border-0 bg-white/80 shadow-xl backdrop-blur-sm transition-all delay-700 duration-700 ${
              animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <CardContent className="p-8">
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h4 className="mb-2 text-lg font-semibold text-red-900">Payment Error</h4>
                    <p className="leading-relaxed text-red-800">
                      Your payment could not be processed at this time. This could be due to
                      insufficient funds, an expired card, or a temporary issue with your bank.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  What would you like to do?
                </h3>
                <p className="leading-relaxed text-gray-600">
                  You can try your payment again, update your payment method, or contact our support
                  team for assistance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div
            className={`space-y-4 transition-all delay-1000 duration-700 ${
              animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <Button
              onClick={handleBackToDashboard}
              variant="ghost"
              className="h-14 w-full bg-red-600 text-lg font-medium text-white hover:bg-red-700"
            >
              <Home className="mr-3 h-5 w-5" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
