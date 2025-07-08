import { LoginForm } from './components/login-form';
import { SignupForm } from './components/signup-form';

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Feemates</h1>
          <p className="text-gray-600">Share subscription fees with ease</p>
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
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Feemates</h1>
          <p className="text-gray-600">Join and start sharing subscription fees</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

export const AuthModule = {
  Login,
  Signup,
};
