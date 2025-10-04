import { Request, Response } from 'express';

// Mock data for development
const mockWallets = [
  {
    id: '1',
    address: '0x1234567890abcdef',
    network: 'ethereum',
    balance: {
      native: '1.5',
      usd: 2500.00
    },
    status: 'active',
    lastActivity: new Date().toISOString(),
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
];

const mockStats = {
  totalWallets: 100,
  activeWallets: 75,
  totalVolume24h: '150.5',
  totalTransactions24h: 1250
};

export const getWallets = (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (+page - 1) * +limit;
  const endIndex = startIndex + +limit;

  const paginatedWallets = mockWallets.slice(startIndex, endIndex);
  
  res.json({
    wallets: paginatedWallets,
    total: mockWallets.length,
    page: +page,
    totalPages: Math.ceil(mockWallets.length / +limit)
  });
};

export const getWalletStats = (req: Request, res: Response) => {
  res.json(mockStats);
};

export const getWalletById = (req: Request, res: Response) => {
  const wallet = mockWallets.find(w => w.id === req.params.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  res.json(wallet);
};

export const updateWallet = (req: Request, res: Response) => {
  const wallet = mockWallets.find(w => w.id === req.params.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  Object.assign(wallet, req.body);
  res.json(wallet);
};

export const blockWallet = (req: Request, res: Response) => {
  const wallet = mockWallets.find(w => w.id === req.params.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  wallet.status = 'blocked';
  res.json(wallet);
};

export const unblockWallet = (req: Request, res: Response) => {
  const wallet = mockWallets.find(w => w.id === req.params.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  wallet.status = 'active';
  res.json(wallet);
};
