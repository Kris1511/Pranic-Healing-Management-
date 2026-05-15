import axiosInstance from './axois.instance';
import { LoginRequest, LoginResponse, User } from '../types/api.types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  getIdToken,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase/firebase.init';

export const authAPI = {
  /**
   * Login user with email, password, and role
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // 1. Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );
    
    // 2. Get ID Token
    const idToken = await getIdToken(userCredential.user);

    // 3. Send token to backend to get local user profile
    const response = await axiosInstance.post<LoginResponse>('/auth/login', { 
      token: idToken,
      role: credentials.role 
    });

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
register: async (userData: any): Promise<LoginResponse> => {
   console.log('REGISTER API CALLED');
  try {

    // 1. Create Firebase User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    // 2. Update Firebase Profile
    await updateProfile(userCredential.user, {
      displayName:
        userData.fullName ||
        `${userData.firstName} ${userData.lastName}`,
    });

    // 3. Get Firebase Token
    const idToken = await getIdToken(userCredential.user);

    // 4. Store User in MySQL
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/register',
      {
        token: idToken,
        name:
          userData.fullName ||
          `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
      }
    );

    return response.data;

  } catch (error: any) {

    // Firebase Error Handling
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already registered');
    }

    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }

    if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters');
    }

    throw error;
  }
},
};
