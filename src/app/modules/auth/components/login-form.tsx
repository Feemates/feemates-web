'use client';
import { useState } from 'react';
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
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { GoogleIcon } from '@/components/common/google-icon';
import { useRouter } from 'nextjs-toploader/app';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
      message:
        'Password must be minimum of 8 characters, with upper and lowercase, and a number and a symbol.',
    }),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginMutation = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Google login attempt');
    router.push('/dashboard');
    setIsGoogleLoading(false);
  };

  const onSubmit = async (values: LoginFormData) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  const handleForgotPasswordClick = () => {
    router.push('/forgot-password');
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-center text-2xl font-semibold">Welcome back</CardTitle>
        <CardDescription className="text-center">Sign in to your Feemates account</CardDescription>
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
                      <FormLabel className="cursor-pointer text-gray-600">Remember me</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base font-medium"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loginMutation.isRedirecting
                ? 'Signing in...'
                : loginMutation.isPending
                  ? 'Signing in...'
                  : 'Sign In'}
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
              disabled={isGoogleLoading || loginMutation.isPending}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              {"Don't have an account? "}
              <button
                type="button"
                className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
                onClick={handleSignupClick}
              >
                Sign up
              </button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
