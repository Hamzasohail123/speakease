'use client';

import { ReactNode } from 'react';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}

