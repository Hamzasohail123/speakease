'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    // Verify email
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast({
          title: 'Email Verified',
          description: 'Your email has been verified successfully. You can now log in.',
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      })
      .catch((error) => {
        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to verify email. The link may have expired. Please request a new verification email.'
        );
      });
  }, [searchParams, router, toast]);

  const handleResend = async () => {
    // For resend, we need the email - redirect to login/register
    toast({
      title: 'Resend Verification',
      description: 'Please use the resend option on the login page or register again.',
    });
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-2 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Your email has been verified!'}
              {status === 'error' && 'Verification failed'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Please wait while we verify your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Email Verified Successfully!</h3>
                  <p className="text-muted-foreground">
                    Your email has been verified. You can now log in to your account.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Redirecting to login page...
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Verification Failed</h3>
                  <p className="text-muted-foreground">{errorMessage}</p>
                </div>
                <div className="space-y-2 w-full">
                  <Button onClick={handleResend} variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </Button>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full">Go to Login</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

