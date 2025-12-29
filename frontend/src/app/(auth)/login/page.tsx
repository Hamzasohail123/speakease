import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/forms/login-form';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-500/50">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back to SpeakEase
          </h1>
          <p className="text-muted-foreground mt-2">
            Continue your English learning journey
          </p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-2 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-muted-foreground">
                  New to SpeakEase?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link href="/register">
              <div className="w-full text-center p-3 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group cursor-pointer">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  Create a new account
                </span>
                <Sparkles className="inline-block w-4 h-4 ml-1 group-hover:animate-pulse" />
              </div>
            </Link>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Practice English with AI-powered conversations
        </p>
      </div>
    </div>
  );
}

