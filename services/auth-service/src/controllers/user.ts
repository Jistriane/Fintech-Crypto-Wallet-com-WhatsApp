import { Request, Response } from 'express';

// Mock data for development
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: '2024-03-15T10:30:00.000Z',
    wallets: [
      {
        id: '1',
        address: '0x1234567890abcdef',
        network: 'ethereum',
        balance: {
          native: '1.5',
          usd: 2500.00
        }
      }
    ],
    twoFactorEnabled: true,
    whatsappVerified: true,
    kycStatus: 'verified'
  }
];

const mockStats = {
  totalUsers: 100,
  activeUsers: 75,
  verifiedUsers: 60,
  kycVerifiedUsers: 45,
  twoFactorEnabledUsers: 80,
  whatsappVerifiedUsers: 70,
  newUsersLast30Days: 25
};

export const getUsers = (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (+page - 1) * +limit;
  const endIndex = startIndex + +limit;

  const paginatedUsers = mockUsers.slice(startIndex, endIndex);
  
  res.json({
    users: paginatedUsers,
    total: mockUsers.length,
    page: +page,
    totalPages: Math.ceil(mockUsers.length / +limit)
  });
};

export const getUserStats = (req: Request, res: Response) => {
  res.json(mockStats);
};

export const getUserById = (req: Request, res: Response) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
};

export const updateUser = (req: Request, res: Response) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  Object.assign(user, req.body);
  res.json(user);
};

export const blockUser = (req: Request, res: Response) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.status = 'blocked';
  res.json(user);
};

export const unblockUser = (req: Request, res: Response) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.status = 'active';
  res.json(user);
};
