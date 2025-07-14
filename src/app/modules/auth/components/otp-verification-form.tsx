'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, WifiOff, RotateCcw } from 'lucide-react';
import { useVerifyOtp } from '../api/useVerifyOtp';
import { useResendOtp } from '../api/useResendOtp';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const formSchema = z.object({
  otp: z.string().length(4, {
    message: 'OTP must be exactly 4 digits.',
  }),
});

type OtpFormData = z.infer<typeof formSchema>;

interface OtpVerificationFormProps {
  email: string;
  userId: string;
  redirectUrl?: string | null;
}

// Custom OTP Input Component
const OtpInputs = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(['', '', '', '']);

  useEffect(() => {
    const otpArray = value.split('').slice(0, 4);
    while (otpArray.length < 4) {
      otpArray.push('');
    }
    setOtp(otpArray);
  }, [value]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1); // Only take the last digit
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length <= 4) {
      const newOtp = pastedData.split('').slice(0, 4);
      while (newOtp.length < 4) {
        newOtp.push('');
      }
      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, 3);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="h-12 w-12 border-2 text-center text-xl font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

export function OtpVerificationForm({ email, userId, redirectUrl }: OtpVerificationFormProps) {
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();
  const { isOffline } = useNetworkStatus();

  const form = useForm<OtpFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const watchedOtp = form.watch('otp');

  useEffect(() => {
    if (watchedOtp.length === 4) {
      // Auto-submit when 4 digits are entered
      form.handleSubmit(onSubmit)();
    }
    //@ts-nocheck
  }, [watchedOtp]);

  const onSubmit = async (values: OtpFormData) => {
    verifyOtpMutation.mutate({
      userId,
      otp: values.otp,
    });
  };

  const handleResendOtp = () => {
    if (canResend && !resendOtpMutation.isPending) {
      resendOtpMutation.mutate(
        { userId },
        {
          onSuccess: () => {
            setResendTimer(30);
            setCanResend(false);
            form.reset();
          },
        }
      );
    }
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
        <CardDescription className="text-secondary-text">
          We&apos;ve sent a 4-digit verification code to
          <br />
          <span className="text-foreground font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-center text-sm font-medium">
                    Enter verification code
                  </FormLabel>
                  <FormControl>
                    <OtpInputs
                      value={field.value}
                      onChange={field.onChange}
                      disabled={verifyOtpMutation.isPending || isOffline}
                    />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Button
                type="submit"
                className="h-12 w-full text-base font-medium"
                disabled={
                  verifyOtpMutation.isPending || isOffline || form.watch('otp').length !== 4
                }
              >
                {isOffline ? (
                  <>
                    <WifiOff className="mr-2 h-4 w-4" />
                    No Internet Connection
                  </>
                ) : (
                  <>
                    {verifyOtpMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {verifyOtpMutation.isRedirecting
                      ? 'Verifying...'
                      : verifyOtpMutation.isPending
                        ? 'Verifying...'
                        : 'Verify Code'}
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendOtpMutation.isPending || isOffline}
                    className="flex w-full items-center justify-center gap-2 font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendOtpMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        Resend Code
                      </>
                    )}
                  </button>
                ) : (
                  <span>
                    Resend code in{' '}
                    <span className="text-foreground font-medium">
                      {Math.floor(resendTimer / 60)}:
                      {(resendTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </span>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  Go back
                </button>
              </div>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
