import { Request, Response } from 'express';
import { User, UserRepository } from '../interfaces/user';

export class UserController {
  constructor(private userRepository: UserRepository) {}

  async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await this.userRepository.findAll(+page, +limit);
      res.json({
        ...result,
        page: +page,
        totalPages: Math.ceil(result.total / +limit)
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const stats = await this.userRepository.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.update(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async blockUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.update(req.params.id, { status: 'blocked' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async unblockUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.update(req.params.id, { status: 'active' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
