import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

const app = express();
const PORT = 3333;
const JWT_SECRET = 'development-secret-key';

app.use(cors());
app.use(express.json());

// Test users
const users = [
  {
    id: 1,
    email: 'admin@cryptowallet.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin'
  }
];

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Login route
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Profile route
app.get('/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

// Dashboard routes
app.use('/dashboard', authMiddleware);

app.get('/dashboard/metrics', (req, res) => {
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

app.get('/dashboard/chart', (req, res) => {
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

app.get('/dashboard/tokens', (req, res) => {
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

app.get('/dashboard/networks', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
