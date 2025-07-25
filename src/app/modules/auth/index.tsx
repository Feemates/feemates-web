import { ForgotPasswordForm } from './components/forgot-password-form';
import { LoginForm } from './components/login-form';
import { ResetPasswordForm } from './components/reset-password-form';
import { SignupForm } from './components/signup-form';
import { OtpVerificationForm } from './components/otp-verification-form';

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-2 text-center">
          <h1 className="mb-2 text-3xl font-bold">Feemates</h1>
          <p className="text-secondary-text">Share subscription fees with ease</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        {/* <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold ">Feemates</h1>
          <p className="text-secondary-text">Join and start sharing subscription fees</p>
        </div> */}
        <SignupForm />
      </div>
    </div>
  );
}

function ForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Feemates</h1>
          <p className="text-secondary-text">Reset your password</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

function ResetPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Feemates</h1>
          <p className="text-secondary-text">Set your new password</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}

function VerifyOtp() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Feemates</h1>
          <p className="text-secondary-text">Verify your email address</p>
        </div>
        {/* OtpVerificationForm is handled in the page component with email prop */}
      </div>
    </div>
  );
}

export const AuthModule = {
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  VerifyOtp,
};

// Export individual components for direct use
export { LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm, OtpVerificationForm };
