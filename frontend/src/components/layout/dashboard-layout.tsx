'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { ProtectedRoute } from '../auth/protected-route';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

