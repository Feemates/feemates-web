'use client';

import { env } from '@/config/env';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

const GOOGLE_CLIENT_ID = env?.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

interface GoogleAuthProviderProps {
  children: ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}
