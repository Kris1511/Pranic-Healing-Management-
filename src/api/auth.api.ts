import axiosInstance from './axois.instance';
import { LoginRequest, LoginResponse, User } from '../types/api.types';

export const authAPI = {
  /**
   * Login user with email, password, and role
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout user - typically just clears client-side state
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  /**
   * Get current logged-in user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/refresh');
    return response.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'HEALER' | 'PATIENT';
  }): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/register', userData);
    return response.data;
  },
};
