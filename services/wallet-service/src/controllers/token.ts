import { Request, Response } from 'express';
import { TokenRepository } from '../interfaces/token';

export class TokenController {
  constructor(private tokenRepository: TokenRepository) {}

  async getTokens(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await this.tokenRepository.findAll(+page, +limit);
      res.json({
        ...result,
        page: +page,
        totalPages: Math.ceil(result.total / +limit)
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTokenStats(req: Request, res: Response) {
    try {
      const stats = await this.tokenRepository.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTokenById(req: Request, res: Response) {
    try {
      const token = await this.tokenRepository.findById(req.params.id);
      if (!token) {
        return res.status(404).json({ error: 'Token not found' });
      }
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateToken(req: Request, res: Response) {
    try {
      const token = await this.tokenRepository.update(req.params.id, req.body);
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async blockToken(req: Request, res: Response) {
    try {
      const token = await this.tokenRepository.block(req.params.id);
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async unblockToken(req: Request, res: Response) {
    try {
      const token = await this.tokenRepository.unblock(req.params.id);
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refreshTokenPrice(req: Request, res: Response) {
    try {
      const token = await this.tokenRepository.refreshPrice(req.params.id);
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
