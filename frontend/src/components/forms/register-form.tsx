'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { isValidEmail, isValidPassword } from '@ai-english-speaker/shared';
import { User, Mail, Lock, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').refine(isValidEmail, {
    message: 'Invalid email format',
  }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(isValidPassword, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, isRegistering } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Registration failed',
        variant: 'destructive',
      });
    }
  };

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="name" 
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Full Name
        </Label>
        <div className="relative group">
          <Input
            id="name"
            placeholder="John Doe"
            className={cn(
              "h-11 pl-4 pr-4 text-base transition-all duration-200",
              "border-2 focus:border-blue-500 dark:focus:border-blue-400",
              "bg-white dark:bg-gray-950",
              "group-hover:border-blue-300 dark:group-hover:border-blue-700",
              errors.name && "border-red-500 focus:border-red-500"
            )}
            {...register('name')}
          />
          {errors.name && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
              {errors.name.message}
            </div>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="email" 
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Email Address
        </Label>
        <div className="relative group">
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={cn(
              "h-11 pl-4 pr-4 text-base transition-all duration-200",
              "border-2 focus:border-blue-500 dark:focus:border-blue-400",
              "bg-white dark:bg-gray-950",
              "group-hover:border-blue-300 dark:group-hover:border-blue-700",
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
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Password
        </Label>
        <div className="relative group">
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className={cn(
              "h-11 pl-4 pr-4 text-base transition-all duration-200",
              "border-2 focus:border-blue-500 dark:focus:border-blue-400",
              "bg-white dark:bg-gray-950",
              "group-hover:border-blue-300 dark:group-hover:border-blue-700",
              errors.password && "border-red-500 focus:border-red-500"
            )}
            {...register('password', {
              onChange: (e) => setPassword(e.target.value),
            })}
          />
          {errors.password && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
              {errors.password.message}
            </div>
          )}
        </div>

        {/* Password Strength Indicators */}
        {password && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-2 animate-in slide-in-from-top-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
            <div className="space-y-1.5">
              <div className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                hasMinLength ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              )}>
                <CheckCircle2 className={cn("w-3.5 h-3.5", hasMinLength && "animate-in zoom-in")} />
                At least 8 characters
              </div>
              <div className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                hasUpperCase ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              )}>
                <CheckCircle2 className={cn("w-3.5 h-3.5", hasUpperCase && "animate-in zoom-in")} />
                One uppercase letter
              </div>
              <div className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                hasLowerCase ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              )}>
                <CheckCircle2 className={cn("w-3.5 h-3.5", hasLowerCase && "animate-in zoom-in")} />
                One lowercase letter
              </div>
              <div className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                hasNumber ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              )}>
                <CheckCircle2 className={cn("w-3.5 h-3.5", hasNumber && "animate-in zoom-in")} />
                One number
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className={cn(
          "w-full h-12 text-base font-semibold mt-6",
          "bg-gradient-to-r from-blue-600 to-purple-600",
          "hover:from-blue-700 hover:to-purple-700",
          "shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        disabled={isRegistering}
      >
        {isRegistering ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating your account...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
}

