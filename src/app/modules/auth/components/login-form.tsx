'use client';
import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '../api/useLogin';
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
import { Eye, EyeOff, Mail, Lock, Loader2, WifiOff, Wifi } from 'lucide-react';
import { GoogleIcon } from '@/components/common/google-icon';
import { useRouter } from 'nextjs-toploader/app';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { env } from '@/config/env';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginMutation = useLogin();
  const { isOffline } = useNetworkStatus();
  const { setToken, setUserId, setUserDetails } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    router.prefetch('/invites');
    router.prefetch('/dashboard');
  }, [router]);

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (codeResponse) => {
      console.log(codeResponse);
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
          toast.success('Please verify your email with the OTP sent to your inbox.');
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
        toast.success(data.message || 'Login successful! Welcome back.');
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

  const handleGoogleLogin = () => {
    if (!isOffline) {
      googleLogin();
    }
  };

  const onSubmit = async (values: LoginFormData) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="">
        {/* <CardTitle className="text-center text-2xl font-semibold">Welcome back</CardTitle>
        <CardDescription className="text-center">Sign in to your Feemates account</CardDescription> */}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                        disabled={loginMutation.isPending}
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
                        placeholder="Enter your password"
                        className="h-12 pr-10 pl-10"
                        disabled={loginMutation.isPending}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loginMutation.isPending}
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
            <div className="flex items-center justify-between text-sm">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-y-0 space-x-1">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel className="text-secondary-text cursor-pointer">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link href="/forgot-password">
                <button
                  type="button"
                  className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </button>
              </Link>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base font-medium"
              disabled={loginMutation.isPending || isOffline}
            >
              {isOffline ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  No Internet Connection
                </>
              ) : (
                <>
                  {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loginMutation.isRedirecting
                    ? 'Signing in...'
                    : loginMutation.isPending
                      ? 'Signing in...'
                      : 'Sign In'}
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
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || loginMutation.isPending || isOffline}
            >
              {isOffline ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  No Internet Connection
                </>
              ) : (
                <>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              {"Don't have an account? "}
              <Link
                href={`/signup${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
              >
                <button
                  type="button"
                  className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
                >
                  Sign up
                </button>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
