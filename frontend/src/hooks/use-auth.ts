import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RegisterRequest, LoginRequest } from '@ai-english-speaker/shared';

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user && !!token;

  // Get current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    retry: false,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Registration no longer returns tokens - user must verify email first
      // Don't set auth or redirect - show verification message instead
      if (data.token) {
        // Legacy support - if token exists, proceed as before
        setAuth(data.user, data.token);
        queryClient.setQueryData(['auth', 'me'], data.user);
        router.push('/dashboard');
      }
      // Otherwise, the form will handle showing verification message
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      router.push('/dashboard');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    user: currentUser || user,
    isLoading,
    isAuthenticated,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: () => logoutMutation.mutate(),
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

