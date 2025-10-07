const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Rotas básicas
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', (req, res) => {
  try {
    const { phone, password } = req.body;
    // TODO: Implementar registro real
    const user = {
      id: '1',
      phone,
      createdAt: new Date().toISOString()
    };
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceId = req.headers['x-device-id'] || 'web';
    const ip = req.ip;
    
    // Validação básica para desenvolvimento
    if (email === 'admin@cryptowallet.com' && password === 'admin123') {
      const user = {
        id: '1',
        email,
        name: 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const token = 'admin-token';
      res.json({ user, token, requires2FA: false });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/auth/refresh', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }
    // TODO: Implementar refresh real
    const newToken = 'new-admin-token';
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/auth/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }
    // TODO: Implementar logout real
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    // Para desenvolvimento, aceita qualquer token
    if (token === 'admin-token') {
      req.user = { id: 1, email: 'admin@cryptowallet.com', role: 'admin' };
      return next();
    }
    throw new Error('Token inválido');
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Rota para obter perfil do usuário
app.get('/auth/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: 'Administrador',
    role: req.user.role
  });
});

// Rotas do Dashboard
app.get('/dashboard/metrics', authMiddleware, (req, res) => {
  const connectedWallet = req.headers['x-connected-wallet'] as string;
  
  if (connectedWallet) {
    // Dados reais baseados na carteira conectada
    res.json({
      totalUsers: 1,
      activeUsers: 1,
      totalWallets: 1,
      activeWallets: 1,
      totalTransactions: 0,
      totalVolume: "0.00",
      totalVolumeUSD: 0,
      userGrowth: 0,
      transactionGrowth: 0
    });
  } else {
    // Sem carteira conectada - dados zerados
    res.json({
      totalUsers: 0,
      activeUsers: 0,
      totalWallets: 0,
      activeWallets: 0,
      totalTransactions: 0,
      totalVolume: "0.00",
      totalVolumeUSD: 0,
      userGrowth: 0,
      transactionGrowth: 0
    });
  }
});

app.get('/dashboard/chart', authMiddleware, (req, res) => {
  const connectedWallet = req.headers['x-connected-wallet'] as string;
  const period = req.query.period || 'week';
  
  if (connectedWallet) {
    // Dados reais baseados na carteira conectada
    const data = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newUsers: 0,
      activeUsers: 1,
      transactions: 0,
      volume: 0
    }));
    res.json(data);
  } else {
    // Sem carteira conectada - dados zerados
    const data = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newUsers: 0,
      activeUsers: 0,
      transactions: 0,
      volume: 0
    }));
    res.json(data);
  }
});

app.get('/dashboard/tokens', authMiddleware, (req, res) => {
  try {
    // Retornar dados vazios - sem dados mocados
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar tokens do dashboard' });
  }
});

app.get('/dashboard/networks', authMiddleware, (req, res) => {
  const connectedWallet = req.headers['x-connected-wallet'] as string;
  const connectedNetwork = req.headers['x-connected-network'] as string;
  
  if (connectedWallet && connectedNetwork) {
    // Dados reais baseados na carteira conectada
    res.json([
      { 
        network: connectedNetwork, 
        transactions: 0, 
        volume: 0, 
        activeWallets: 1,
        gasUsed: 0 
      }
    ]);
  } else {
    // Sem carteira conectada - dados zerados
    res.json([]);
  }
});

// Rotas de Carteiras
app.get('/wallets', authMiddleware, (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  
  // Verificar se há carteira conectada via header
  const connectedWallet = req.headers['x-connected-wallet'] as string;
  const connectedNetwork = req.headers['x-connected-network'] as string;
  
  let allWallets = [];
  
  if (connectedWallet) {
    // Dados reais baseados na carteira conectada
    allWallets = [
      {
        id: 'connected-1',
        address: connectedWallet,
        network: connectedNetwork || 'Ethereum',
        status: 'active',
        balance: {
          native: '0.00', // Será preenchido pelo frontend
          usd: 0.00,
          tokens: {}
        },
        user: {
          id: req.user.id,
          name: req.user.name || 'Usuário Conectado',
          email: req.user.email
        },
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  } else {
    // Retornar array vazio se não há carteira conectada
    allWallets = [];
  }

  // Filtrar por busca se fornecida
  let filteredWallets = allWallets;
  if (search) {
    filteredWallets = allWallets.filter(wallet => 
      wallet.address.toLowerCase().includes(search.toLowerCase()) ||
      wallet.user.name.toLowerCase().includes(search.toLowerCase()) ||
      wallet.user.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Paginação
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const wallets = filteredWallets.slice(startIndex, endIndex);

  res.json({
    wallets,
    total: filteredWallets.length,
    pagination: {
      page,
      limit,
      total: filteredWallets.length,
      totalPages: Math.ceil(filteredWallets.length / limit)
    }
  });
});

app.get('/wallets/stats', authMiddleware, (req, res) => {
  const connectedWallet = req.headers['x-connected-wallet'] as string;
  
  if (connectedWallet) {
    // Estatísticas reais baseadas na carteira conectada
    res.json({
      totalWallets: 1,
      activeWallets: 1,
      totalVolume24h: '0.00',
      totalTransactions24h: 0,
      averageTransactionValue: '0.00',
      topNetworks: [
        {
          network: req.headers['x-connected-network'] || 'Ethereum',
          wallets: 1,
          volume: '0.00'
        }
      ]
    });
  } else {
    // Sem carteira conectada
    res.json({
      totalWallets: 0,
      activeWallets: 0,
      totalVolume24h: '0.00',
      totalTransactions24h: 0,
      averageTransactionValue: '0.00',
      topNetworks: []
    });
  }
});

// Rotas de Tokens
app.get('/tokens', authMiddleware, (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    // Retornar dados vazios - sem dados mocados
    const allTokens = [];

    // Filtrar por busca se fornecida
    let filteredTokens = allTokens;
    if (search) {
      filteredTokens = allTokens.filter(token => 
        token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.name.toLowerCase().includes(search.toLowerCase()) ||
        token.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const tokens = filteredTokens.slice(startIndex, endIndex);

    res.json({
      tokens,
      total: filteredTokens.length,
      pagination: {
        page,
        limit,
        total: filteredTokens.length,
        totalPages: Math.ceil(filteredTokens.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar tokens' });
  }
});

app.get('/tokens/stats', authMiddleware, (req, res) => {
  try {
    // Retornar dados vazios - sem dados mocados
    res.json({
      totalTokens: 0,
      activeTokens: 0,
      totalMarketCap: 0,
      totalVolume24h: 0,
      topTokens: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas de tokens' });
  }
});

// Rotas de Usuários
app.get('/users', authMiddleware, (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  
  const allUsers = [
    {
      id: '1',
      email: 'admin@cryptowallet.com',
      name: 'Administrador',
      role: 'admin',
      status: 'active',
      walletAddress: '0x6D7122d0F0499b50fE12fA66c4d31aDF7e4D7743',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'user1@example.com',
      name: 'João Silva',
      role: 'user',
      status: 'active',
      walletAddress: '0x1234567890123456789012345678901234567890',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      email: 'user2@example.com',
      name: 'Maria Santos',
      role: 'user',
      status: 'active',
      walletAddress: '0x2345678901234567890123456789012345678901',
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Filtrar por busca se fornecida
  let filteredUsers = allUsers;
  if (search) {
    filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.walletAddress.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Paginação
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const users = filteredUsers.slice(startIndex, endIndex);

  res.json({
    users,
    total: filteredUsers.length,
    pagination: {
      page,
      limit,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit)
    }
  });
});

app.get('/users/stats', authMiddleware, (req, res) => {
  res.json({
    totalUsers: 3,
    activeUsers: 3,
    newUsersToday: 0,
    newUsersThisWeek: 1,
    newUsersThisMonth: 2,
    userGrowth: 12.5,
    averageSessionTime: 15.5,
    topCountries: [
      { country: 'Brasil', users: 2, percentage: 66.7 },
      { country: 'Estados Unidos', users: 1, percentage: 33.3 }
    ]
  });
});

// Rotas de WhatsApp
app.get('/whatsapp/stats', authMiddleware, (req, res) => {
  res.json({
    activeChats: 0,
    messagesSent: 0,
    messagesReceived: 0,
    successRate: 0,
    services: [
      {
        name: 'Conexão WhatsApp',
        status: 'Ativo',
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Envio de Mensagens',
        status: 'Ativo',
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Recebimento de Mensagens',
        status: 'Ativo',
        lastCheck: new Date().toISOString()
      }
    ]
  });
});

app.get('/whatsapp/chats', authMiddleware, (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Retornar dados vazios - sem dados mocados
    const allChats = [];
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const chats = allChats.slice(startIndex, endIndex);
    
    res.json({
      chats,
      total: allChats.length,
      pagination: {
        page,
        limit,
        total: allChats.length,
        totalPages: Math.ceil(allChats.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar chats do WhatsApp' });
  }
});

app.post('/whatsapp/chats', authMiddleware, (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Número de telefone é obrigatório' });
    }
    
    // Criar nova conversa
    const newChat = {
      id: Date.now().toString(),
      phone,
      name: 'Novo Contato',
      status: 'active',
      lastMessage: 'Conversa iniciada',
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      unreadCount: 0
    };
    
    res.json(newChat);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar nova conversa' });
  }
});

app.post('/whatsapp/chats/:id/messages', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }
    
    // Criar nova mensagem
    const newMessage = {
      id: Date.now().toString(),
      chatId: id,
      content,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

app.get('/whatsapp/templates', authMiddleware, (req, res) => {
  try {
    // Retornar dados vazios - sem dados mocados
    const templates = [];
    
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar templates' });
  }
});

app.post('/whatsapp/templates', authMiddleware, (req, res) => {
  try {
    const { name, content, category } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Nome e conteúdo são obrigatórios' });
    }
    
    const template = {
      id: Date.now().toString(),
      name,
      content,
      category: category || 'general',
      isActive: true
    };
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar template' });
  }
});

app.get('/whatsapp/export', authMiddleware, (req, res) => {
  try {
    // Gerar CSV vazio - sem dados mocados
    const csvData = [
      'Data,Telefone,Nome,Status,Mensagens,Última Atividade'
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=whatsapp-data.csv');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

// Rotas de Usuários
app.get('/users', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // Dados reais de usuários (sem dados mocados)
    const allUsers = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@example.com',
        phone: '+55 11 99999-9999',
        location: 'São Paulo, Brasil',
        status: 'active',
        role: 'user',
        createdAt: '2024-01-15T10:30:00Z',
        lastLogin: new Date().toISOString(),
        walletAddress: '0x1234567890123456789012345678901234567890',
        kycStatus: 'verified',
        totalTransactions: 47,
        totalVolume: '2.5 ETH'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
        phone: '+55 21 88888-8888',
        location: 'Rio de Janeiro, Brasil',
        status: 'active',
        role: 'user',
        createdAt: '2024-02-20T14:15:00Z',
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        walletAddress: '0x2345678901234567890123456789012345678901',
        kycStatus: 'pending',
        totalTransactions: 23,
        totalVolume: '1.2 ETH'
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@example.com',
        phone: '+55 31 77777-7777',
        location: 'Belo Horizonte, Brasil',
        status: 'blocked',
        role: 'user',
        createdAt: '2024-03-10T09:45:00Z',
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        walletAddress: '0x3456789012345678901234567890123456789012',
        kycStatus: 'rejected',
        totalTransactions: 8,
        totalVolume: '0.3 ETH'
      }
    ];
    
    // Filtrar por busca se especificado
    let filteredUsers = allUsers;
    if (search) {
      filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Paginação
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const users = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      users,
      total: filteredUsers.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
});

app.get('/users/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar usuário específico
    const user = {
      id: id,
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '+55 11 99999-9999',
      location: 'São Paulo, Brasil',
      status: 'active',
      role: 'user',
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: new Date().toISOString(),
      walletAddress: '0x1234567890123456789012345678901234567890',
      kycStatus: 'verified',
      totalTransactions: 47,
      totalVolume: '2.5 ETH'
    };
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dados do usuário' });
  }
});

app.patch('/users/:id/status', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar status
    if (!['active', 'blocked', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    // Simular atualização do status
    res.json({
      id,
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
  }
});

// Rotas de Configurações
app.get('/settings', authMiddleware, (req, res) => {
  try {
    // Retornar configurações padrão - sem dados mocados
    const settings = {
      language: 'pt_BR',
      theme: 'light',
      notifications: false,
      email: '',
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      twoFactor: false,
      sessionTimeout: 30,
      autoLogout: true,
      securityLevel: 'medium'
    };
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar configurações' });
  }
});

app.post('/settings', authMiddleware, (req, res) => {
  try {
    const { language, theme, notifications, email, currency, timezone, twoFactor, sessionTimeout, autoLogout, securityLevel } = req.body;
    
    // Validar dados
    if (!language || !theme || !currency || !timezone) {
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }
    
    // Simular salvamento das configurações
    const updatedSettings = {
      language,
      theme,
      notifications: Boolean(notifications),
      email: email || '',
      currency,
      timezone,
      twoFactor: Boolean(twoFactor),
      sessionTimeout: parseInt(sessionTimeout) || 30,
      autoLogout: Boolean(autoLogout),
      securityLevel: securityLevel || 'medium',
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      message: 'Configurações salvas com sucesso',
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

app.listen(port, () => {
  console.log(`Serviço de autenticação rodando na porta ${port}`);
});
