'use client';

import ProtectedRoutesWrapper from '@/wrappers/protected-route-wrappers';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoutesWrapper isProtectedRoute={false}>{children}</ProtectedRoutesWrapper>;
}
