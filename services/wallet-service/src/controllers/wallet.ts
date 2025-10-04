import { Request, Response } from 'express';
import { WalletRepository } from '../interfaces/wallet';

export class WalletController {
  constructor(private walletRepository: WalletRepository) {}

  async getWallets(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await this.walletRepository.findAll(+page, +limit);
      res.json({
        ...result,
        page: +page,
        totalPages: Math.ceil(result.total / +limit)
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWalletStats(req: Request, res: Response) {
    try {
      const stats = await this.walletRepository.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWalletById(req: Request, res: Response) {
    try {
      const wallet = await this.walletRepository.findById(req.params.id);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateWallet(req: Request, res: Response) {
    try {
      const wallet = await this.walletRepository.update(req.params.id, req.body);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async blockWallet(req: Request, res: Response) {
    try {
      const wallet = await this.walletRepository.block(req.params.id);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async unblockWallet(req: Request, res: Response) {
    try {
      const wallet = await this.walletRepository.unblock(req.params.id);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
