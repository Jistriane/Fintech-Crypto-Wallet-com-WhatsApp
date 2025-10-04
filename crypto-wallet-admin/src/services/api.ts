import axios from 'axios';
import { ApiResponse } from '@/types/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
  api.defaults.headers.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
  delete api.defaults.headers.Authorization;
};

export const handleApiError = (error: any): string => {
  // Erro de conexão
  if (error.code === 'ERR_NETWORK') {
    return 'Erro de conexão com o servidor. Verifique se o servidor está rodando na porta 3333';
  }
  
  // Erro da API
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Erro genérico com mensagem
  if (error.message) {
    return error.message;
  }
  
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
};

export default api;
