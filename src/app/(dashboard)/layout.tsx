'use client';

import ProtectedRoutesWrapper from '@/wrappers/protected-route-wrappers';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoutesWrapper isProtectedRoute={true}>{children}</ProtectedRoutesWrapper>;
}
