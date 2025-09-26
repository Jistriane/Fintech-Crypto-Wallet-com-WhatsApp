import { Request, Response } from 'express';
import { WalletService } from '../../domain/services/WalletService';
import { PriceService } from '../../domain/services/PriceService';
import { ILogger } from '@fintech/common';

export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly priceService: PriceService,
    private readonly logger: ILogger
  ) {}

  async createWallet(req: Request, res: Response): Promise<void> {
    try {
      const { userId, network } = req.body;

      const wallet = await this.walletService.createWallet(userId, network);

      res.status(201).json({
        message: 'Wallet created successfully',
        wallet: {
          id: wallet.id,
          address: wallet.address,
          network: wallet.network
        }
      });

      this.logger.info('Wallet created', { userId, network, walletId: wallet.id });
    } catch (error) {
      this.logger.error('Error creating wallet', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWalletBalance(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;

      const balance = await this.walletService.getWalletBalance(walletId);

      res.json({
        nativeBalance: balance.nativeBalance,
        tokens: balance.tokens.map(token => ({
          symbol: token.tokenSymbol,
          balance: token.balance,
          valueUSD: token.balanceUSD
        })),
        totalValueUSD: balance.totalValueUSD
      });
    } catch (error) {
      this.logger.error('Error getting wallet balance', { error, walletId: req.params.walletId });

      if (error.message === 'Wallet not found') {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async sendTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { to, amount, tokenAddress } = req.body;

      const transaction = await this.walletService.sendTransaction(
        walletId,
        to,
        amount,
        tokenAddress
      );

      res.json({
        message: 'Transaction sent successfully',
        transaction: {
          id: transaction.id,
          hash: transaction.hash,
          status: transaction.status
        }
      });

      this.logger.info('Transaction sent', {
        walletId,
        to,
        amount,
        tokenAddress,
        transactionId: transaction.id
      });
    } catch (error) {
      this.logger.error('Error sending transaction', {
        error,
        walletId: req.params.walletId,
        to: req.body.to,
        amount: req.body.amount
      });

      if (error.message === 'Wallet not found') {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }

      if (error.message === 'Invalid recipient address') {
        res.status(400).json({ error: 'Invalid recipient address' });
        return;
      }

      if (error.message === 'Too many pending transactions') {
        res.status(429).json({ error: 'Too many pending transactions' });
        return;
      }

      if (error.message === 'Gas limit too high') {
        res.status(400).json({ error: 'Gas limit too high' });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addToken(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { tokenAddress } = req.body;

      const token = await this.walletService.addToken(walletId, tokenAddress);

      res.json({
        message: 'Token added successfully',
        token: {
          symbol: token.tokenSymbol,
          balance: token.balance,
          valueUSD: token.balanceUSD
        }
      });
    } catch (error) {
      this.logger.error('Error adding token', {
        error,
        walletId: req.params.walletId,
        tokenAddress: req.body.tokenAddress
      });

      if (error.message === 'Wallet not found') {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }

      if (error.message === 'Token already added') {
        res.status(409).json({ error: 'Token already added' });
        return;
      }

      if (error.message === 'Invalid token contract') {
        res.status(400).json({ error: 'Invalid token contract' });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeToken(req: Request, res: Response): Promise<void> {
    try {
      const { walletId, tokenAddress } = req.params;

      await this.walletService.removeToken(walletId, tokenAddress);

      res.json({
        message: 'Token removed successfully'
      });
    } catch (error) {
      this.logger.error('Error removing token', {
        error,
        walletId: req.params.walletId,
        tokenAddress: req.params.tokenAddress
      });

      if (error.message === 'Token not found') {
        res.status(404).json({ error: 'Token not found' });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addPriceAlert(req: Request, res: Response): Promise<void> {
    try {
      const { tokenId } = req.params;
      const { condition, price } = req.body;

      await this.priceService.addPriceAlert(tokenId, condition, price);

      res.json({
        message: 'Price alert added successfully'
      });
    } catch (error) {
      this.logger.error('Error adding price alert', {
        error,
        tokenId: req.params.tokenId,
        condition: req.body.condition,
        price: req.body.price
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removePriceAlert(req: Request, res: Response): Promise<void> {
    try {
      const { tokenId, alertId } = req.params;

      await this.priceService.removePriceAlert(tokenId, alertId);

      res.json({
        message: 'Price alert removed successfully'
      });
    } catch (error) {
      this.logger.error('Error removing price alert', {
        error,
        tokenId: req.params.tokenId,
        alertId: req.params.alertId
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { limit, offset } = req.query;

      const transactions = await this.walletService.getTransactionHistory(
        walletId,
        Number(limit),
        Number(offset)
      );

      res.json({
        transactions: transactions.map(tx => ({
          id: tx.id,
          hash: tx.hash,
          type: tx.type,
          status: tx.status,
          amount: tx.amount,
          amountUSD: tx.amountUSD,
          from: tx.from,
          to: tx.to,
          createdAt: tx.createdAt
        }))
      });
    } catch (error) {
      this.logger.error('Error getting transaction history', {
        error,
        walletId: req.params.walletId
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const settings = req.body;

      const wallet = await this.walletService.updateSettings(walletId, settings);

      res.json({
        message: 'Settings updated successfully',
        settings: wallet.settings
      });
    } catch (error) {
      this.logger.error('Error updating settings', {
        error,
        walletId: req.params.walletId,
        settings: req.body
      });

      if (error.message === 'Wallet not found') {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addTrustedAddress(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { address } = req.body;

      const wallet = await this.walletService.addTrustedAddress(walletId, address);

      res.json({
        message: 'Trusted address added successfully',
        trustedAddresses: wallet.trustedAddresses
      });
    } catch (error) {
      this.logger.error('Error adding trusted address', {
        error,
        walletId: req.params.walletId,
        address: req.body.address
      });

      if (error.message === 'Invalid address') {
        res.status(400).json({ error: 'Invalid address' });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeTrustedAddress(req: Request, res: Response): Promise<void> {
    try {
      const { walletId, address } = req.params;

      const wallet = await this.walletService.removeTrustedAddress(walletId, address);

      res.json({
        message: 'Trusted address removed successfully',
        trustedAddresses: wallet.trustedAddresses
      });
    } catch (error) {
      this.logger.error('Error removing trusted address', {
        error,
        walletId: req.params.walletId,
        address: req.params.address
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async backupWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { backupMethod } = req.body;

      const wallet = await this.walletService.backupWallet(walletId, backupMethod);

      res.json({
        message: 'Wallet backup successful',
        backupInfo: wallet.backupInfo
      });
    } catch (error) {
      this.logger.error('Error backing up wallet', {
        error,
        walletId: req.params.walletId,
        backupMethod: req.body.backupMethod
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async blockWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { reason } = req.body;

      const wallet = await this.walletService.blockWallet(walletId, reason);

      res.json({
        message: 'Wallet blocked successfully',
        status: wallet.status
      });
    } catch (error) {
      this.logger.error('Error blocking wallet', {
        error,
        walletId: req.params.walletId,
        reason: req.body.reason
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async unblockWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;

      const wallet = await this.walletService.unblockWallet(walletId);

      res.json({
        message: 'Wallet unblocked successfully',
        status: wallet.status
      });
    } catch (error) {
      this.logger.error('Error unblocking wallet', {
        error,
        walletId: req.params.walletId
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTokenPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { tokenId } = req.params;
      const { days } = req.query;

      const performance = await this.priceService.getTokenPerformance(
        tokenId,
        Number(days)
      );

      res.json({ performance });
    } catch (error) {
      this.logger.error('Error getting token performance', {
        error,
        tokenId: req.params.tokenId,
        days: req.query.days
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPortfolioDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;

      const distribution = await this.priceService.getPortfolioDistribution(walletId);

      res.json({ distribution });
    } catch (error) {
      this.logger.error('Error getting portfolio distribution', {
        error,
        walletId: req.params.walletId
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTopTokens(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;

      const tokens = await this.priceService.getTopTokensByValue(Number(limit));

      res.json({ tokens });
    } catch (error) {
      this.logger.error('Error getting top tokens', {
        error,
        limit: req.query.limit
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
