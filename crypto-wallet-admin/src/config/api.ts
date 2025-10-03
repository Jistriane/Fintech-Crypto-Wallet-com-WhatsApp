import { mockApiResponse } from '@/mocks/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/login`,
  adminLogin: `${API_BASE_URL}/admin/login`,
  verify: `${API_BASE_URL}/verify`,
  register: `${API_BASE_URL}/register`,
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Em desenvolvimento, usa o mock da API
    if (isDevelopment) {
      try {
        // Remove o API_BASE_URL do endpoint para o mock
        const mockEndpoint = endpoint.replace(API_BASE_URL, '');
        const response = await mockApiResponse(mockEndpoint, options);
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Erro ao processar requisição');
      }
    }

    // Em produção, faz a chamada real à API
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    // Verifica o tipo de conteúdo da resposta
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Resposta inesperada do servidor: HTML recebido em vez de JSON');
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Erro ao parsear resposta JSON:', error);
      throw new Error('Erro ao processar resposta do servidor');
    }

    if (!response.ok) {
      throw new Error(data.message || `Erro do servidor: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao acessar a API');
  }
};