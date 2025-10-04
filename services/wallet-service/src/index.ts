const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3334;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Wallet Routes
app.get('/wallets', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const wallets = [
      { 
        id: '1', 
        userId: '1', 
        address: '0x1234567890123456789012345678901234567890', 
        network: 'ethereum',
        balanceNative: 1.5,
        balanceUsd: 3000,
        status: 'active'
      }
    ];
    res.json({
      wallets,
      total: 1,
      page: +page,
      totalPages: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/wallets/stats', (req, res) => {
  try {
    const stats = {
      totalWallets: 1,
      activeWallets: 1,
      totalVolume24h: 0,
      totalTransactions24h: 0
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token Routes
app.get('/tokens', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const tokens = [
      { 
        id: '1', 
        symbol: 'ETH', 
        name: 'Ethereum', 
        address: '0x0000000000000000000000000000000000000000',
        network: 'ethereum',
        decimals: 18,
        priceUsd: 2000,
        priceChange24h: 5.2,
        volume24h: 1000000,
        marketCap: 240000000000,
        status: 'active'
      }
    ];
    res.json({
      tokens,
      total: 1,
      page: +page,
      totalPages: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/tokens/stats', (req, res) => {
  try {
    const stats = {
      totalTokens: 1,
      activeTokens: 1,
      totalVolume24h: 1000000,
      totalMarketCap: 240000000000
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Wallet service running on port ${port}`);
});

