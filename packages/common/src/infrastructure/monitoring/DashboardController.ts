import { Request, Response } from 'express';
import { MetricsService } from './MetricsService';
import { ILogger } from '../../domain/interfaces/ILogger';

export class DashboardController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly logger: ILogger
  ) {}

  async getTransactionMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe } = req.query;
      const metrics = await this.metricsService.getTransactionMetrics(timeframe as string);
      res.json(metrics);
    } catch (error: unknown) {
      this.logger.error('Error getting transaction metrics', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe } = req.query;
      const metrics = await this.metricsService.getUserMetrics(timeframe as string);
      res.json(metrics);
    } catch (error: unknown) {
      this.logger.error('Error getting user metrics', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWalletMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe } = req.query;
      const metrics = await this.metricsService.getWalletMetrics(timeframe as string);
      res.json(metrics);
    } catch (error: unknown) {
      this.logger.error('Error getting wallet metrics', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getKYCMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe } = req.query;
      const metrics = await this.metricsService.getKYCMetrics(timeframe as string);
      res.json(metrics);
    } catch (error: unknown) {
      this.logger.error('Error getting KYC metrics', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWhatsAppMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe } = req.query;
      const metrics = await this.metricsService.getWhatsAppMetrics(timeframe as string);
      res.json(metrics);
    } catch (error: unknown) {
      this.logger.error('Error getting WhatsApp metrics', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.getSystemMetrics();
      res.json(metrics);
    } catch (error: unknown) {
      this.logger.error('Error getting system metrics', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTransactionVolume(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe, network } = req.query;
      const volume = await this.metricsService.getTransactionVolume(
        timeframe as string,
        network as string
      );

      const volumeByDay: Record<string, number> = {};
      volume.forEach(entry => {
        volumeByDay[entry.date] = entry.volume;
      });

      res.json(volumeByDay);
    } catch (error: unknown) {
      this.logger.error('Error getting transaction volume', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTokenDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { network } = req.query;
      const distribution = await this.metricsService.getTokenDistribution(
        network as string
      );

      const distributionByToken: Record<string, number> = {};
      distribution.forEach(entry => {
        distributionByToken[entry.token] = entry.amount;
      });

      const sortedDistribution = Object.entries(distributionByToken)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [token, amount]) => {
          acc[token] = amount;
          return acc;
        }, {} as Record<string, number>);

      res.json(sortedDistribution);
    } catch (error: unknown) {
      this.logger.error('Error getting token distribution', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}