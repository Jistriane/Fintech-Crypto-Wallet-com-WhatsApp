'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS, fetchApi } from '@/config/api';

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isAdminLogin) {
        // Login administrativo (sem verificação em duas etapas)
        const response = await fetchApi(API_ENDPOINTS.adminLogin, {
          method: 'POST',
          body: JSON.stringify({ email: identifier, password }),
        });

        if (response.success) {
          router.push('/dashboard');
        } else {
          setError(response.message || 'Credenciais inválidas');
        }
      } else {
        // Login normal com verificação em duas etapas
        if (!showVerification) {
          const response = await fetchApi(API_ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify({ phone: identifier, password }),
          });
          
          if (response.success) {
            setShowVerification(true);
          } else {
            setError(response.message || 'Erro ao fazer login. Tente novamente.');
          }
        } else {
          const response = await fetchApi(API_ENDPOINTS.verify, {
            method: 'POST',
            body: JSON.stringify({ phone: identifier, verificationCode }),
          });

          if (response.success) {
            router.push('/dashboard');
          } else {
            setError(response.message || 'Código de verificação inválido.');
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isAdminLogin ? 'Acesso administrativo' : 'Acesse sua carteira crypto'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-500 text-center text-sm bg-red-100 dark:bg-red-900 p-3 rounded">
              {error}
            </div>
          )}
          {!showVerification || isAdminLogin ? (
            <>
              <div>
                <label htmlFor="identifier" className="sr-only">
                  {isAdminLogin ? 'Email' : 'Telefone'}
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type={isAdminLogin ? 'email' : 'tel'}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                  placeholder={isAdminLogin ? 'Email administrativo' : 'Telefone'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                Enviamos um código de verificação para seu WhatsApp
              </p>
              <input
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Digite o código"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="admin-login"
                name="admin-login"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={isAdminLogin}
                onChange={(e) => {
                  setIsAdminLogin(e.target.checked);
                  setShowVerification(false);
                  setError('');
                }}
              />
              <label htmlFor="admin-login" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Login administrativo
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : showVerification ? 'Verificar' : 'Entrar'}
            </button>
          </div>
        </form>

        {!isAdminLogin && (
          <div className="text-center mt-4">
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Não tem uma conta? Registre-se
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}