import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types/api.types';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  branch: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      branch: null,
      loading: false,
      error: null,

      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          role: user.role,
          branch: user.branch || null,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          role: null,
          branch: null,
          error: null,
          loading: false,
        }),

      setLoading: (loading: boolean) => set({ loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      updateUser: (userUpdates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null,
        })),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        branch: state.branch,
      }),
    }
  )
);
