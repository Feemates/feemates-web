'use client';

import { useGetMe } from '@/api/get-user';
import ProtectedRoutesWrapper from '@/wrappers/protected-route-wrappers';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const me = useGetMe();
  return <ProtectedRoutesWrapper isProtectedRoute={true}>{children}</ProtectedRoutesWrapper>;
}
