'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, DollarSign, Sparkles } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';

import { useSearchParams } from 'next/navigation';

export const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscription_id');
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [timer, setTimer] = useState(3);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Trigger animations in sequence
    const timer1 = setTimeout(() => setAnimationStep(1), 300);
    const timer2 = setTimeout(() => setAnimationStep(2), 800);
    const timer3 = setTimeout(() => setAnimationStep(3), 1300);
    const timer4 = setTimeout(() => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (animationStep >= 3 && !showButton) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setShowButton(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [animationStep, showButton]);

  const handleRedirect = () => {
    if (subscriptionId) {
      router.push(`/subscription/${subscriptionId}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 h-24 w-24 animate-pulse rounded-full bg-green-200 opacity-20"></div>
        <div className="absolute top-1/4 -right-8 h-32 w-32 animate-bounce rounded-full bg-emerald-200 opacity-15"></div>
        <div className="absolute bottom-1/4 -left-6 h-20 w-20 animate-pulse rounded-full bg-teal-200 opacity-25 delay-1000"></div>
        <div className="absolute right-1/4 -bottom-8 h-28 w-28 animate-bounce rounded-full bg-green-300 opacity-10 delay-500"></div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Success Icon with Animation */}
          <div className="text-center">
            <div
              className={`mb-8 inline-flex h-32 w-32 items-center justify-center rounded-full bg-green-100 transition-all duration-1000 ${
                animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <div
                className={`transition-all delay-300 duration-500 ${
                  animationStep >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                }`}
              >
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <div
              className={`transition-all delay-500 duration-700 ${
                animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h1 className="mb-4 text-4xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="mb-8 text-xl text-gray-600">
                Your payment has been processed successfully
              </p>
            </div>
          </div>

          {/* Success Message Card */}
          <Card
            className={`border-0 bg-white/80 shadow-xl backdrop-blur-sm transition-all delay-700 duration-700 ${
              animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">All Set!</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Your subscription payment has been completed. You can now enjoy your shared
                subscription benefits.
              </p>
            </CardContent>
          </Card>

          {/* Timer and Redirect Button */}
          <div
            className={`transition-all delay-1000 duration-700 ${
              animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            {!showButton ? (
              <div className="flex flex-col items-center justify-center">
                <span className="mb-2 text-lg text-gray-500">
                  Redirect options available in <span className="font-bold">{timer}</span>{' '}
                  seconds...
                </span>
                <Button
                  disabled
                  className="h-14 w-full bg-green-400 text-lg font-medium text-white"
                >
                  {subscriptionId ? 'Go to Subscription Details' : 'Back to Dashboard'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleRedirect}
                className="h-14 w-full bg-green-600 text-lg font-medium text-white hover:bg-green-700"
              >
                <Home className="mr-3 h-5 w-5" />
                {subscriptionId ? 'Go to Subscription Details' : 'Back to Dashboard'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
