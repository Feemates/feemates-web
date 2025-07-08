import { GoogleAuthProvider } from '@/app/modules/auth/components/google-auth-provider';
import { AuthModule } from '@/app/modules/auth';

export default function SignupPage() {
  return (
    <GoogleAuthProvider>
      <AuthModule.Signup />
    </GoogleAuthProvider>
  );
}
