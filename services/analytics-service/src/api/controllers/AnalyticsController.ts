import { Request, Response } from 'express';
import { AnalyticsService } from '../../domain/services/AnalyticsService';
import { ILogger } from '@fintech/common';

export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly logger: ILogger
  ) {}

  async trackMetric(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService.trackMetric(req.body);

      res.status(201).json({
        message: 'Metric tracked successfully',
        analytics: {
          id: analytics.id,
          type: analytics.type,
          name: analytics.name,
          value: analytics.value,
          timestamp: analytics.timestamp
        }
      });

      this.logger.info('Metric tracked', {
        analyticsId: analytics.id,
        type: analytics.type,
        name: analytics.name
      });
    } catch (error) {
      this.logger.error('Error tracking metric', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMetricSummary(req: Request, res: Response): Promise<void> {
    try {
      const { type, name } = req.params;

      const summary = await this.analyticsService.getMetricSummary(type, name);

      res.json(summary);
    } catch (error) {
      this.logger.error('Error getting metric summary', {
        error,
        type: req.params.type,
        name: req.params.name
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTimeSeries(req: Request, res: Response): Promise<void> {
    try {
      const { type, name } = req.params;
      const { startTime, endTime, granularity, dimensions } = req.query;

      const timeSeries = await this.analyticsService.getTimeSeries(
        type,
        name,
        granularity as any,
        new Date(startTime as string),
        new Date(endTime as string),
        dimensions as any
      );

      res.json({
        timeSeries: timeSeries.map(t => ({
          timestamp: t.timestamp,
          value: t.value,
          dimensions: t.dimensions
        }))
      });
    } catch (error) {
      this.logger.error('Error getting time series', {
        error,
        type: req.params.type,
        name: req.params.name,
        query: req.query
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDimensionDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { type, name } = req.params;
      const { dimension } = req.query;

      const distribution = await this.analyticsService.getDimensionDistribution(
        type,
        name,
        dimension as string
      );

      res.json({ distribution });
    } catch (error) {
      this.logger.error('Error getting dimension distribution', {
        error,
        type: req.params.type,
        name: req.params.name,
        dimension: req.query.dimension
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCorrelations(req: Request, res: Response): Promise<void> {
    try {
      const { type, name } = req.params;
      const { otherMetrics } = req.query;

      const correlations = await this.analyticsService.getCorrelations(
        type,
        name,
        otherMetrics as string[]
      );

      res.json({ correlations });
    } catch (error) {
      this.logger.error('Error getting correlations', {
        error,
        type: req.params.type,
        name: req.params.name,
        otherMetrics: req.query.otherMetrics
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { type, name } = req.params;

      const anomalies = await this.analyticsService.getAnomalies(type, name);

      res.json({
        anomalies: anomalies.map(a => ({
          id: a.id,
          timestamp: a.timestamp,
          value: a.value,
          dimensions: a.dimensions
        }))
      });
    } catch (error) {
      this.logger.error('Error getting anomalies', {
        error,
        type: req.params.type,
        name: req.params.name
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const { type, name } = req.params;
      const { granularity, periods } = req.query;

      const trends = await this.analyticsService.getTrends(
        type,
        name,
        granularity as any,
        parseInt(periods as string)
      );

      res.json({ trends });
    } catch (error) {
      this.logger.error('Error getting trends', {
        error,
        type: req.params.type,
        name: req.params.name,
        query: req.query
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTopDimensions(req: Request, res: Response): Promise<void> {
    try {
      const { type, name } = req.params;
      const { dimension, limit } = req.query;

      const topDimensions = await this.analyticsService.getTopDimensions(
        type,
        name,
        dimension as string,
        parseInt(limit as string)
      );

      res.json({ topDimensions });
    } catch (error) {
      this.logger.error('Error getting top dimensions', {
        error,
        type: req.params.type,
        name: req.params.name,
        query: req.query
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
