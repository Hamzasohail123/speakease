import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/forms/register-form';
import { Sparkles, MessageSquare, Zap, Target, TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-300/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/50">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join SpeakEase Today
          </h1>
          <p className="text-muted-foreground mt-2">
            Start your journey to fluent English
          </p>
        </div>

        {/* Benefits Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
            <Zap className="w-3 h-3" />
            AI-Powered
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
            <Target className="w-3 h-3" />
            Personalized
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            Track Progress
          </div>
        </div>

        {/* Register Card */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-2 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link href="/login">
              <div className="w-full text-center p-3 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group cursor-pointer">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Sign in to your account
                </span>
                <Sparkles className="inline-block w-4 h-4 ml-1 group-hover:animate-pulse" />
              </div>
            </Link>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

