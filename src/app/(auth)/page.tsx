import { GoogleAuthProvider } from '@/app/modules/auth/components/google-auth-provider';
import { AuthModule } from '../modules/auth';

export default function LoginPage() {
  return (
    <GoogleAuthProvider>
      <AuthModule.Login />
    </GoogleAuthProvider>
  );
}
