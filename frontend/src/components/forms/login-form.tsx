'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Login failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="email" 
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Email Address
        </Label>
        <div className="relative group">
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={cn(
              "h-11 pl-4 pr-4 text-base transition-all duration-200",
              "border-2 focus:border-purple-500 dark:focus:border-purple-400",
              "bg-white dark:bg-gray-950",
              "group-hover:border-purple-300 dark:group-hover:border-purple-700",
              errors.email && "border-red-500 focus:border-red-500"
            )}
            {...register('email')}
          />
          {errors.email && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
              {errors.email.message}
            </div>
          )}
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="password" 
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Password
        </Label>
        <div className="relative group">
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className={cn(
              "h-11 pl-4 pr-4 text-base transition-all duration-200",
              "border-2 focus:border-purple-500 dark:focus:border-purple-400",
              "bg-white dark:bg-gray-950",
              "group-hover:border-purple-300 dark:group-hover:border-purple-700",
              errors.password && "border-red-500 focus:border-red-500"
            )}
            {...register('password')}
          />
          {errors.password && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
              {errors.password.message}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className={cn(
          "w-full h-12 text-base font-semibold mt-6",
          "bg-gradient-to-r from-purple-600 to-blue-600",
          "hover:from-purple-700 hover:to-blue-700",
          "shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  );
}

