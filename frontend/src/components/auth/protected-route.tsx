'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

