'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import type { User, LoginCredentials, TwoFactorVerification } from '@/types/api';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verify2FA: (verification: TwoFactorVerification) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verifica se há um token no localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await authService.getProfile();
      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      // Limpa o token inválido
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      const response = await authService.login(credentials);
      
      if (response.requires2FA) {
        router.push('/verify-2fa');
        return;
      }

      setUser(response.user);
      router.push('/admin/dashboard');
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login');
      throw error;
    }
  }

  async function verify2FA(verification: TwoFactorVerification) {
    try {
      const response = await authService.verify2FA(verification);
      setUser(response.user);
      router.push('/admin/dashboard');
      toast.success('Verificação 2FA realizada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao verificar código 2FA');
      throw error;
    }
  }

  async function logout() {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
      console.error('Erro ao fazer logout:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        verify2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
