// Mock de usuários para desenvolvimento
const users = {
  admin: {
    email: 'admin@cryptowallet.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
  },
  user: {
    phone: '5511999999999',
    password: 'user123',
    name: 'Usuário Teste',
    role: 'user',
  },
};

// Mock de respostas da API
export const mockApiResponse = async (endpoint: string, options: RequestInit) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula latência

  const body = options.body ? JSON.parse(options.body as string) : {};

  switch (endpoint) {
    case '/admin/login': {
      const { email, password } = body;
      if (email === users.admin.email && password === users.admin.password) {
        return {
          success: true,
          data: {
            user: {
              name: users.admin.name,
              email: users.admin.email,
              role: users.admin.role,
            },
            token: 'mock-admin-token',
          },
        };
      }
      throw new Error('Credenciais inválidas');
    }

    case '/login': {
      const { phone, password } = body;
      if (phone === users.user.phone && password === users.user.password) {
        return {
          success: true,
          message: 'Código de verificação enviado',
        };
      }
      throw new Error('Credenciais inválidas');
    }

    case '/verify': {
      const { verificationCode } = body;
      if (verificationCode === '123456') {
        return {
          success: true,
          data: {
            user: {
              name: users.user.name,
              phone: users.user.phone,
              role: users.user.role,
            },
            token: 'mock-user-token',
          },
        };
      }
      throw new Error('Código de verificação inválido');
    }

    default:
      throw new Error('Endpoint não encontrado');
  }
};
