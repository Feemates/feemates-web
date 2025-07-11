'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Eye, EyeOff, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useResetPassword } from '../api/useResetPassword';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
        message:
          'Password must be minimum of 8 characters, with upper and lowercase, and a number and a symbol.',
      }),
    confirmPassword: z.string().min(8, {
      message: 'Please confirm your password.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [urlParams, setUrlParams] = useState<{ token: string; uid: string } | null>(null);
  const [hasValidParams, setHasValidParams] = useState<boolean | null>(null);
  const { isOffline } = useNetworkStatus();

  const { mutate: resetPassword, isPending, isRedirecting } = useResetPassword();

  useEffect(() => {
    const token = searchParams.get('token');
    const uid = searchParams.get('uid');

    if (token && uid) {
      setUrlParams({ token, uid });
      setHasValidParams(true);
    } else {
      setHasValidParams(false);
    }
  }, [searchParams]);

  // Handle redirect in a separate useEffect to avoid infinite loop
  useEffect(() => {
    if (hasValidParams === false) {
      router.push('/forgot-password');
    }
  }, [hasValidParams, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!urlParams) {
      return;
    }

    resetPassword(
      {
        token: urlParams.token,
        user_id: parseInt(urlParams.uid, 10),
        new_password: values.password,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  if (isSuccess || isRedirecting) {
    return (
      <Card className="w-full border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Password Reset Successfully!</h2>
          <p className="mb-4 text-gray-600">Your password has been reset successfully.</p>
          <p className="text-sm text-gray-500">Redirecting you to the login page...</p>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while checking URL params
  if (hasValidParams === null) {
    return (
      <Card className="w-full border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
          <p className="text-gray-600">Verifying reset link...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error state for invalid params (this will briefly show before redirect)
  if (hasValidParams === false) {
    return (
      <Card className="w-full border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <CheckCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
          <p className="mb-4 text-gray-600">The reset link is invalid or has expired.</p>
          <p className="text-sm text-gray-500">Redirecting to forgot password...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-center text-2xl font-semibold">Reset Password</CardTitle>
        <CardDescription className="text-center">Enter your new password below</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        className="h-12 pr-10 pl-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        className="h-12 pr-10 pl-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">Password Requirements</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• At least 8 characters long</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include at least one number</li>
                <li>• Include at least one special character</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              type="submit"
              className="h-12 w-full text-base font-medium"
              disabled={isPending || isOffline}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-800"
                onClick={handleBackToLogin}
              >
                Sign in
              </button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
