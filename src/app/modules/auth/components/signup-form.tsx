'use client';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Eye, EyeOff, Mail, Lock, User, Loader2, WifiOff, Wifi } from 'lucide-react';
import { GoogleIcon } from '@/components/common/google-icon';
import { useSignup } from '../api/useSignup';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useRouter } from 'nextjs-toploader/app';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import { env } from '@/config/env';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(50, {
      message: 'Name cannot be more than 50 characters.',
    })
    .regex(/^[A-Za-z\s]+$/, {
      message: 'Name can only contain letters and spaces.',
    }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z
    .string()
    .min(8, {
      message:
        'Password must be minimum of 8 characters, with upper and lowercase, and a number and a symbol.',
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
      message:
        'Password must be minimum of 8 characters, with upper and lowercase, and a number and a symbol.',
    }),
  agreeToTerms: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms of service and privacy policy to continue',
  }),
});

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const signupMutation = useSignup();
  const { isOffline } = useNetworkStatus();
  const { setToken, setUserId, setUserDetails } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { agreeToTerms, ...signupData } = values;
    signupMutation.mutate(signupData);
  };

  const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
    // This runs when validation fails
    setHasAttemptedSubmit(true);
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (codeResponse) => {
      try {
        setIsGoogleLoading(true);
        // Send the authorization code to your backend
        const response = await fetch(
          `${env?.NEXT_PUBLIC_BASE_API_URL}/auth/google/login-or-signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: codeResponse.access_token,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Google authentication failed');
        }
        const data = await response.json();

        // Check if OTP verification is required
        if (!data.user.is_otp_verified) {
          // Don't store tokens yet, redirect to OTP verification
          const redirectTo = searchParams.get('redirect') || null;
          let otpUrl = `/verify-otp?email=${encodeURIComponent(data.user.email)}&userId=${data.user.id}`;

          // Pass redirect parameter to OTP page if it exists
          if (redirectTo) {
            otpUrl += `&redirect=${encodeURIComponent(redirectTo)}`;
          }

          setTimeout(() => {
            router.push(otpUrl);
          }, 100);
          toast.success(
            'Account created successfully! Please verify your email with the OTP sent to your inbox.'
          );
          return;
        }

        // Store tokens and user details
        setToken(data.access_token, data.refresh_token);
        setUserId(data.user.id.toString());
        setUserDetails(data.user);
        // Handle redirection
        const redirectTo = searchParams.get('redirect') || null;

        setTimeout(() => {
          try {
            if (redirectTo) {
              // Use decodeURIComponent to handle encoded URLs properly
              const decodedRedirectTo = decodeURIComponent(redirectTo);
              // Prefetch the redirect page to avoid chunk loading issues
              router.prefetch(decodedRedirectTo);
              router.replace(decodedRedirectTo);
            } else if (data.invited_subscriptions && data.invited_subscriptions > 0) {
              router.push('/invites');
            } else {
              router.push('/dashboard');
            }
          } catch (error) {
            console.error('Redirect error:', error);
            // Fallback to dashboard if redirect fails
            router.push('/dashboard');
          }
        }, 100);
        // Show success message
        toast.success(data.message || 'Account created successfully! Welcome to Feemates.');
      } catch (error: any) {
        toast.error(error);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      if (error?.error === 'access_denied') {
        // User cancelled or denied access: redirect to login page
        router.push('/');
        setIsGoogleLoading(false);
        return;
      }
      // All other errors: show generic failure toast
      toast.error('Google login failed. Please try again or use email/password.');
      setIsGoogleLoading(false);
    },
  });

  const handleGoogleSignup = () => {
    if (!isOffline) {
      googleLogin();
    }
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-semibold">Create account</CardTitle>
        <CardDescription className="text-secondary-text text-center">
          Sign up for your Feemates account
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleFormSubmit}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        className="h-12 pl-10"
                        disabled={signupMutation.isPending}
                        {...field}
                      />
                      {/* Character count in bottom right, absolute */}
                      <div className="pointer-events-none absolute right-3 -bottom-5 text-xs text-gray-500">
                        {field.value.length} / 50
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="h-12 pl-10"
                        disabled={signupMutation.isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="h-12 pr-10 pl-10"
                        disabled={signupMutation.isPending}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={signupMutation.isPending}
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
              name="agreeToTerms"
              render={({ field, fieldState }) => {
                const shouldHighlight = (hasAttemptedSubmit && !field.value) || fieldState.error;
                return (
                  <FormItem
                    className={`flex flex-row items-start space-y-0 space-x-3 pt-2 transition-all duration-200 ${
                      shouldHighlight
                        ? 'animate-pulse rounded-lg border-2 border-red-300 bg-red-50/50 p-3 shadow-sm'
                        : ''
                    }`}
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // Reset highlight when user checks the box
                          if (checked && hasAttemptedSubmit) {
                            setHasAttemptedSubmit(false);
                          }
                        }}
                        className={`mt-0.5 transition-all duration-200 ${
                          shouldHighlight ? 'border-red-400 shadow-md ring-2 ring-red-200' : ''
                        }`}
                        disabled={signupMutation.isPending}
                      />
                    </FormControl>
                    <div className="min-w-0 flex-1 space-y-1 leading-none">
                      <div
                        className={`cursor-pointer text-sm leading-relaxed transition-colors duration-200 ${
                          shouldHighlight ? 'font-medium text-red-700' : 'text-secondary-text'
                        }`}
                        onClick={() => {
                          const newValue = !field.value;
                          field.onChange(newValue);
                          if (newValue && hasAttemptedSubmit) {
                            setHasAttemptedSubmit(false);
                          }
                        }}
                      >
                        <span className="inline">I agree to the </span>
                        <a
                          href="/terms-conditions"
                          className="inline font-medium text-blue-600 underline hover:text-blue-800"
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms of Service
                        </a>
                        <span className="inline"> and </span>
                        <a
                          href="/privacy-policy"
                          className="inline font-medium text-blue-600 underline hover:text-blue-800"
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Privacy Policy
                        </a>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                );
              }}
            />

            <Button
              type="submit"
              className="h-12 w-full text-base font-medium"
              disabled={signupMutation.isPending || isOffline}
            >
              {isOffline ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  No Internet Connection
                </>
              ) : (
                <>
                  {signupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {signupMutation.isRedirecting
                    ? 'Creating account...'
                    : signupMutation.isPending
                      ? 'Creating account...'
                      : 'Create Account'}
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading || signupMutation.isPending || isOffline}
            >
              {isOffline ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  No Internet Connection
                </>
              ) : (
                <>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-secondary-text text-center text-sm">
              Already have an account?{' '}
              <Link
                href={`/${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
              >
                <button type="button" className="font-medium text-blue-600 hover:text-blue-800">
                  Sign in
                </button>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
