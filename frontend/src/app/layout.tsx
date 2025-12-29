import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpeakEase - AI English Speaking Practice',
  description: 'SpeakEase - Practice English speaking with an AI partner that remembers you',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

