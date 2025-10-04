import { Request, Response } from 'express';

// Mock data for development
const mockTokens = [
  {
    id: '1',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    network: 'ethereum',
    price: {
      usd: 1650.00,
      change24h: 2.5
    },
    volume24h: 1500000,
    marketCap: 200000000000,
    status: 'active'
  }
];

const mockStats = {
  totalTokens: 100,
  activeTokens: 80,
  totalVolume24h: 15000000,
  totalMarketCap: 500000000000
};

export const getTokens = (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (+page - 1) * +limit;
  const endIndex = startIndex + +limit;

  const paginatedTokens = mockTokens.slice(startIndex, endIndex);
  
  res.json({
    tokens: paginatedTokens,
    total: mockTokens.length,
    page: +page,
    totalPages: Math.ceil(mockTokens.length / +limit)
  });
};

export const getTokenStats = (req: Request, res: Response) => {
  res.json(mockStats);
};

export const getTokenById = (req: Request, res: Response) => {
  const token = mockTokens.find(t => t.id === req.params.id);
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  res.json(token);
};

export const updateToken = (req: Request, res: Response) => {
  const token = mockTokens.find(t => t.id === req.params.id);
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  Object.assign(token, req.body);
  res.json(token);
};
