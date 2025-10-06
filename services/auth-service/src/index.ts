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
  res.json({
    totalUsers: 1250,
    activeUsers: 980,
    totalWallets: 1500,
    activeWallets: 980,
    totalTransactions: 4567,
    totalVolume: "156.78",
    totalVolumeUSD: 275000,
    userGrowth: 12.5,
    transactionGrowth: 10.1
  });
});

app.get('/dashboard/chart', authMiddleware, (req, res) => {
  const period = req.query.period || 'week';
  const data = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    newUsers: Math.floor(Math.random() * 50) + 20,
    activeUsers: Math.floor(Math.random() * 200) + 100,
    transactions: Math.floor(Math.random() * 100) + 50,
    volume: Math.floor(Math.random() * 10) + 5
  }));
  res.json(data);
});

app.get('/dashboard/tokens', authMiddleware, (req, res) => {
  res.json([
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      price: 2250.75,
      priceChange24h: 2.5,
      volume24h: 45230000,
      marketCap: 270000000000,
      holders: 7890
    },
    { 
      symbol: 'BNB', 
      name: 'Binance Coin', 
      price: 234.56,
      priceChange24h: -1.2,
      volume24h: 12345000,
      marketCap: 36000000000,
      holders: 4560
    },
    { 
      symbol: 'USDT', 
      name: 'Tether', 
      price: 1.00,
      priceChange24h: 0.01,
      volume24h: 78901230000,
      marketCap: 83000000000,
      holders: 12340
    },
    { 
      symbol: 'MATIC', 
      name: 'Polygon', 
      price: 0.56,
      priceChange24h: 5.4,
      volume24h: 3456780000,
      marketCap: 5200000000,
      holders: 5670
    }
  ]);
});

app.get('/dashboard/networks', authMiddleware, (req, res) => {
  res.json([
    { 
      network: 'Ethereum', 
      transactions: 1234, 
      volume: 89.12, 
      activeWallets: 456,
      gasUsed: 123456 
    },
    { 
      network: 'BSC', 
      transactions: 5678, 
      volume: 234.56, 
      activeWallets: 789,
      gasUsed: 234567 
    },
    { 
      network: 'Polygon', 
      transactions: 9012, 
      volume: 345.67, 
      activeWallets: 123,
      gasUsed: 345678 
    },
    { 
      network: 'Arbitrum', 
      transactions: 3456, 
      volume: 123.45, 
      activeWallets: 234,
      gasUsed: 456789 
    }
  ]);
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

app.listen(port, () => {
  console.log(`Serviço de autenticação rodando na porta ${port}`);
});
