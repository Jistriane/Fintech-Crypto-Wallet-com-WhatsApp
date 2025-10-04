import { Request, Response } from 'express';

// TODO: Implementar repositório real
export async function getUsers(req: Request, res: Response) {
  try {
    const { page = 1, limit = 10 } = req.query;
    // Mock data por enquanto
    const users = [
      { id: '1', name: 'Admin', email: 'admin@example.com', status: 'active' }
    ];
    res.json({
      users,
      total: 1,
      page: +page,
      totalPages: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserStats(req: Request, res: Response) {
  try {
    // Mock data por enquanto
    const stats = {
      totalUsers: 1,
      activeUsers: 1,
      kycApproved: 0,
      kycPending: 1
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    // Mock data por enquanto
    const user = {
      id: req.params.id,
      name: 'Admin',
      email: 'admin@example.com',
      status: 'active'
    };
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    // Mock data por enquanto
    const user = {
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function blockUser(req: Request, res: Response) {
  try {
    // Mock data por enquanto
    const user = {
      id: req.params.id,
      status: 'blocked',
      updatedAt: new Date().toISOString()
    };
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function unblockUser(req: Request, res: Response) {
  try {
    // Mock data por enquanto
    const user = {
      id: req.params.id,
      status: 'active',
      updatedAt: new Date().toISOString()
    };
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
