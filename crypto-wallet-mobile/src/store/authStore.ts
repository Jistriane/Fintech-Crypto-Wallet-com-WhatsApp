import { create } from 'zustand';
import {
  AuthState,
  LoginCredentials,
  RegisterData,
  VerifyCodeData,
  ResetPasswordData,
  UpdatePasswordData,
} from '@/types/auth';
import AuthService from '@/services/authService';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyCode: (data: VerifyCodeData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  updatePassword: (data: UpdatePasswordData) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

const authService = AuthService.getInstance();

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const user = await authService.getProfile();
      set({ user, isLoading: false });
    } catch (error) {
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(credentials);
      set({ user, token, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao fazer login',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao criar conta',
        isLoading: false,
      });
      throw error;
    }
  },

  verifyCode: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.verifyCode(data);
      if (response) {
        const { user, token } = response;
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao verificar código',
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao resetar senha',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authService.updatePassword(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar senha',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({ user: null, token: null, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao fazer logout',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
