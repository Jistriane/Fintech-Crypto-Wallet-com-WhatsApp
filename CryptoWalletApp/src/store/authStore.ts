import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, VerificationData, ResetPasswordData, User } from '../types/auth';
import authService from '../services/authService';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyPhone: (data: VerificationData) => Promise<void>;
  resendVerificationCode: (phone: string) => Promise<void>;
  requestPasswordReset: (phone: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      set({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer login',
      });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(data);
      set({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao registrar',
      });
      throw error;
    }
  },

  verifyPhone: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await authService.verifyPhone(data);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar telefone',
      });
      throw error;
    }
  },

  resendVerificationCode: async (phone) => {
    try {
      set({ isLoading: true, error: null });
      await authService.resendVerificationCode(phone);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao reenviar código',
      });
      throw error;
    }
  },

  requestPasswordReset: async (phone) => {
    try {
      set({ isLoading: true, error: null });
      await authService.requestPasswordReset(phone);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha',
      });
      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await authService.resetPassword(data);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao redefinir senha',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer logout',
      });
    }
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const isAuthenticated = await authService.checkAuth();
      set({ isAuthenticated, isLoading: false });
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar autenticação',
      });
    }
  },
}));

export default useAuthStore;
