import { create } from 'zustand';
import { AuthState, LoginCredentials, UpdateProfileData, ChangePasswordCredentials } from '@/types/auth';
import AuthService from '@/services/authService';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (credentials: ChangePasswordCredentials) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const authService = AuthService.getInstance();

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(credentials);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha na autenticação',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar perfil',
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await authService.changePassword(credentials);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao alterar senha',
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
