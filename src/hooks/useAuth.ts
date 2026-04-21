import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { authAPI } from '../api/auth.api';
import { LoginRequest, User } from '../types/api.types';

export const useAuth = () => {
  const { user, token, role, branch, loading, error, setAuth, logout, setLoading, setError, clearError } =
    useAuthStore();

  /**
   * Login mutation - handles email/password/role login
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      setLoading(true);
      clearError();
      try {
        const response = await authAPI.login(credentials);
        setAuth(response.user, response.token);
        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      clearError();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authAPI.logout();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        logout();
      }
    },
  });

  /**
   * Get current user query
   */
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser,
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });

  /**
   * Forgot password mutation
   */
  const forgotPasswordMutation = useMutation({
    mutationFn: authAPI.requestPasswordReset,
    onSuccess: () => {
      clearError();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to request password reset';
      setError(errorMessage);
    },
  });

  /**
   * Reset password mutation
   */
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authAPI.resetPassword(token, password),
    onSuccess: () => {
      clearError();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'HEALER' | 'PATIENT';
    }) => {
      setLoading(true);
      clearError();
      try {
        const response = await authAPI.register(userData);
        setAuth(response.user, response.token);
        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const isAuthenticated = !!token && !!user;

  return {
    // Auth state
    user: currentUser || user,
    token,
    role,
    branch,
    isAuthenticated,
    loading: loading || isLoadingUser || loginMutation.isPending,
    error,

    // Methods
    login: loginMutation.mutate,
    logout: handleLogout,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    register: registerMutation.mutate,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isForgottingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,

    // Clear error
    clearError,
  };
};
