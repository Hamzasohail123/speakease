import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Lexend was designed specifically to improve reading proficiency and fluency —
// a deliberate choice for headings on an English-learning product, not decoration.
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

// Set NEXT_PUBLIC_SITE_URL to the real production domain once deployed —
// metadataBase resolves every relative OG/canonical URL below against it.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://speakease.app';

const title = 'SpeakEase — AI English Speaking Practice';
const description =
  'Practice speaking English with an AI partner that adapts to your level, remembers your progress, and gives instant feedback. Available 24/7, no scheduling, no judgment.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | SpeakEase',
  },
  description,
  keywords: [
    'learn English speaking',
    'AI English tutor',
    'English conversation practice',
    'speaking practice app',
    'AI language learning',
    'English fluency',
  ],
  authors: [{ name: 'SpeakEase' }],
  applicationName: 'SpeakEase',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'SpeakEase',
    title,
    description,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, lexend.variable)}>
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

