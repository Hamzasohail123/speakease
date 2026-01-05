'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const isAuthenticated = !!user && !!token;

  // Wait for Zustand persist to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only redirect after hydration is complete
    if (isHydrated && !isAuthenticated) {
      // Store the current path to redirect back after login
      const returnUrl = pathname !== '/login' ? pathname : '/dashboard';
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

