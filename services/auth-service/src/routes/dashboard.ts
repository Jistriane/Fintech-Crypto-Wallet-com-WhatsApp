import { Router } from 'express';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(verifyToken);

// Métricas gerais do dashboard
router.get('/metrics', (req, res) => {
  res.json({
    totalUsers: 1250,
    activeWallets: 980,
    totalVolume: "156.78",
    transactions: 4567,
    growthRates: {
      users: 12.5,
      wallets: 8.3,
      volume: 15.2,
      transactions: 10.1
    }
  });
});

// Dados do gráfico
router.get('/chart', (req, res) => {
  const period = req.query.period || 'week';
  const data = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transactions: Math.floor(Math.random() * 100) + 50,
    volume: (Math.random() * 10 + 5).toFixed(2)
  }));
  res.json(data);
});

// Métricas dos tokens
router.get('/tokens', (req, res) => {
  res.json([
    { symbol: 'ETH', name: 'Ethereum', volume: '45.23', transactions: 789 },
    { symbol: 'BNB', name: 'Binance Coin', volume: '123.45', transactions: 456 },
    { symbol: 'USDT', name: 'Tether', volume: '78901.23', transactions: 1234 },
    { symbol: 'MATIC', name: 'Polygon', volume: '3456.78', transactions: 567 }
  ]);
});

// Métricas das redes
router.get('/networks', (req, res) => {
  res.json([
    { name: 'Ethereum', transactions: 1234, volume: '89.12', activeUsers: 456 },
    { name: 'BSC', transactions: 5678, volume: '234.56', activeUsers: 789 },
    { name: 'Polygon', transactions: 910, volume: '45.67', activeUsers: 123 },
    { name: 'Arbitrum', transactions: 432, volume: '78.90', activeUsers: 345 }
  ]);
});

// Métricas do WhatsApp
router.get('/whatsapp', (req, res) => {
  res.json({
    activeChats: 567,
    messagesSent: 12345,
    messagesReceived: 12789,
    successRate: 98.5
  });
});

export default router;