import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { SmartWalletService } from '../../domain/SmartWalletService';
import { SwapService } from '../../domain/SwapService';
import { Network, Token } from '@common/types';
import { rateLimitMiddleware } from '@common/infrastructure/middleware/rateLimitMiddleware';
import { AuthenticatedRequest } from '@common/infrastructure/middleware/rateLimitMiddleware';

export class WalletController {
  constructor(
    private readonly walletService: SmartWalletService,
    private readonly swapService: SwapService
  ) {}

  async createWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { network } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const wallet = await this.walletService.createWallet(
        userId,
        network as Network
      );

      res.status(201).json(wallet);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create wallet',
        message: error.message
      });
    }
  }

  async transfer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId, toAddress, token, amount } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validar endereço
      if (!await this.walletService.validateAddress(toAddress, token.network)) {
        res.status(400).json({ error: 'Invalid address' });
        return;
      }

      const transaction = await this.walletService.transfer(
        walletId,
        toAddress,
        token as Token,
        ethers.utils.parseUnits(amount, token.decimals)
      );

      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to execute transfer',
        message: error.message
      });
    }
  }

  async getSwapQuote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId, tokenIn, tokenOut, amountIn } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const route = await this.swapService.getSwapQuote(
        walletId,
        tokenIn as Token,
        tokenOut as Token,
        ethers.utils.parseUnits(amountIn, tokenIn.decimals)
      );

      res.status(200).json({
        ...route,
        amountOut: ethers.utils.formatUnits(route.amountOut, tokenOut.decimals),
        fee: ethers.utils.formatUnits(route.fee, tokenIn.decimals)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get swap quote',
        message: error.message
      });
    }
  }

  async executeSwap(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId, tokenIn, tokenOut, amountIn, minAmountOut } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const transaction = await this.swapService.executeSwap(
        walletId,
        tokenIn as Token,
        tokenOut as Token,
        ethers.utils.parseUnits(amountIn, tokenIn.decimals),
        ethers.utils.parseUnits(minAmountOut, tokenOut.decimals)
      );

      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to execute swap',
        message: error.message
      });
    }
  }

  async getBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { token } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (token) {
        const balance = await this.walletService.getBalance(
          walletId,
          token as unknown as Token
        );

        res.status(200).json({
          token,
          balance: ethers.utils.formatUnits(balance, token.decimals)
        });
      } else {
        const balances = await this.walletService.getAllBalances(walletId);

        res.status(200).json(
          balances.map(({ token, balance }) => ({
            token,
            balance: ethers.utils.formatUnits(balance, token.decimals)
          }))
        );
      }
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get balance',
        message: error.message
      });
    }
  }

  async getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { startDate, endDate } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const transactions = await this.walletService.getTransactionHistory(
        walletId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get transaction history',
        message: error.message
      });
    }
  }

  async deactivateWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await this.walletService.deactivateWallet(walletId);

      res.status(200).json({
        message: 'Wallet deactivated successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to deactivate wallet',
        message: error.message
      });
    }
  }

  setupRoutes(app: any): void {
    const router = app.Router();

    // Aplicar rate limiting
    router.use(rateLimitMiddleware);

    // Rotas
    router.post('/wallets', this.createWallet.bind(this));
    router.post('/wallets/:walletId/transfer', this.transfer.bind(this));
    router.get('/wallets/:walletId/balance', this.getBalance.bind(this));
    router.get('/wallets/:walletId/transactions', this.getTransactionHistory.bind(this));
    router.post('/wallets/:walletId/deactivate', this.deactivateWallet.bind(this));
    
    // Rotas de swap
    router.post('/swap/quote', this.getSwapQuote.bind(this));
    router.post('/swap/execute', this.executeSwap.bind(this));

    app.use('/api/v1/defi', router);
  }
}
