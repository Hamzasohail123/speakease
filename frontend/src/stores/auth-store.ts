import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@ai-english-speaker/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      isAuthenticated: () => {
        const state = get();
        return !!state.user && !!state.token;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

