import { IAnalyticsRepository } from '../repositories/IAnalyticsRepository';
import {
  Analytics,
  AnalyticsType,
  MetricType,
  TimeGranularity
} from '../entities/Analytics';
import { ILogger } from '@fintech-crypto/common';
import { Channel } from 'amqplib';
import { Redis } from 'ioredis';
import { Decimal } from 'decimal.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsServiceConfig {
  defaultGranularity: TimeGranularity;
  retentionDays: number;
  anomalyThreshold: number;
  correlationThreshold: number;
  cacheExpiration: number;
}

export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: IAnalyticsRepository,
    private readonly logger: ILogger,
    private readonly messageQueue: Channel,
    private readonly redis: Redis,
    private readonly config: AnalyticsServiceConfig
  ) {
    this.startEventProcessor();
  }

  async trackMetric(data: {
    type: AnalyticsType;
    name: string;
    value: string | number | Decimal;
    metricType: MetricType;
    granularity?: TimeGranularity;
    dimensions?: Analytics['dimensions'];
    metadata?: Analytics['metadata'];
  }): Promise<Analytics> {
    try {
      const analytics = await this.analyticsRepository.create({
        ...data,
        granularity: data.granularity || this.config.defaultGranularity,
        value: new Decimal(data.value.toString()).toString(),
        timestamp: new Date()
      });

      // Verifica thresholds
      const thresholdCheck = analytics.checkThresholds();
      if (thresholdCheck.exceeded) {
        await this.publishThresholdAlert(analytics, thresholdCheck.level!);
      }

      // Verifica anomalias
      const isAnomaly = await this.checkForAnomaly(analytics);
      if (isAnomaly) {
        await this.publishAnomalyAlert(analytics);
      }

      // Atualiza cache
      await this.updateMetricCache(analytics);

      return analytics;
    } catch (error) {
      this.logger.error('Error tracking metric', { error, data });
      throw error;
    }
  }

  async getMetricSummary(type: AnalyticsType, name: string): Promise<{
    current: string;
    previous: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
    stats: Analytics['stats'];
  }> {
    try {
      // Tenta buscar do cache
      const cacheKey = `metric_summary:${type}:${name}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const summary = await this.analyticsRepository.getMetricSummary(type, name);

      // Salva no cache
      await this.redis.set(
        cacheKey,
        JSON.stringify(summary),
        'EX',
        this.config.cacheExpiration
      );

      return summary;
    } catch (error) {
      this.logger.error('Error getting metric summary', { error, type, name });
      throw error;
    }
  }

  async getTimeSeries(
    type: AnalyticsType,
    name: string,
    granularity: TimeGranularity,
    startTime: Date,
    endTime: Date,
    dimensions?: Analytics['dimensions']
  ): Promise<Analytics[]> {
    try {
      return await this.analyticsRepository.getTimeSeries(
        type,
        name,
        granularity,
        startTime,
        endTime,
        dimensions
      );
    } catch (error) {
      this.logger.error('Error getting time series', {
        error,
        type,
        name,
        granularity,
        startTime,
        endTime,
        dimensions
      });
      throw error;
    }
  }

  async getDimensionDistribution(
    type: AnalyticsType,
    name: string,
    dimension: string
  ): Promise<{
    dimension: string;
    count: number;
    percentage: number;
  }[]> {
    try {
      return await this.analyticsRepository.getDimensionDistribution(
        type,
        name,
        dimension
      );
    } catch (error) {
      this.logger.error('Error getting dimension distribution', {
        error,
        type,
        name,
        dimension
      });
      throw error;
    }
  }

  async getCorrelations(
    type: AnalyticsType,
    name: string,
    otherMetrics: string[]
  ): Promise<{
    metric: string;
    correlation: number;
  }[]> {
    try {
      const correlations = await this.analyticsRepository.getCorrelations(
        type,
        name,
        otherMetrics
      );

      // Filtra correlações significativas
      return correlations.filter(
        c => Math.abs(c.correlation) >= this.config.correlationThreshold
      );
    } catch (error) {
      this.logger.error('Error getting correlations', {
        error,
        type,
        name,
        otherMetrics
      });
      throw error;
    }
  }

  async getAnomalies(
    type: AnalyticsType,
    name: string
  ): Promise<Analytics[]> {
    try {
      return await this.analyticsRepository.getAnomalies(
        type,
        name,
        this.config.anomalyThreshold
      );
    } catch (error) {
      this.logger.error('Error getting anomalies', { error, type, name });
      throw error;
    }
  }

  async getTrends(
    type: AnalyticsType,
    name: string,
    granularity: TimeGranularity,
    periods: number
  ): Promise<{
    period: Date;
    value: string;
    change: string;
  }[]> {
    try {
      return await this.analyticsRepository.getTrends(
        type,
        name,
        granularity,
        periods
      );
    } catch (error) {
      this.logger.error('Error getting trends', {
        error,
        type,
        name,
        granularity,
        periods
      });
      throw error;
    }
  }

  async getTopDimensions(
    type: AnalyticsType,
    name: string,
    dimension: string,
    limit: number
  ): Promise<{
    dimension: string;
    value: string;
    count: number;
  }[]> {
    try {
      return await this.analyticsRepository.getTopDimensions(
        type,
        name,
        dimension,
        limit
      );
    } catch (error) {
      this.logger.error('Error getting top dimensions', {
        error,
        type,
        name,
        dimension,
        limit
      });
      throw error;
    }
  }

  private async startEventProcessor(): Promise<void> {
    try {
      // Configura filas
      await this.messageQueue.assertQueue('analytics.events', { durable: true });
      await this.messageQueue.assertQueue('analytics.alerts', { durable: true });

      // Processa eventos
      await this.messageQueue.consume('analytics.events', async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());
          await this.processEvent(event);
          this.messageQueue.ack(msg);
        } catch (error) {
          this.logger.error('Error processing analytics event', {
            error,
            messageId: msg.properties.messageId
          });
          this.messageQueue.nack(msg, false, true);
        }
      });
    } catch (error) {
      this.logger.error('Error starting event processor', { error });
      throw error;
    }
  }

  private async processEvent(event: any): Promise<void> {
    try {
      // Extrai métricas do evento
      const metrics = this.extractMetrics(event);

      // Processa cada métrica
      await Promise.all(
        metrics.map(metric =>
          this.trackMetric(metric).catch(error => {
            this.logger.error('Error tracking metric from event', {
              error,
              metric,
              event
            });
          })
        )
      );
    } catch (error) {
      this.logger.error('Error processing event', { error, event });
      throw error;
    }
  }

  private extractMetrics(event: any): Array<Parameters<typeof this.trackMetric>[0]> {
    const metrics: Array<Parameters<typeof this.trackMetric>[0]> = [];

    switch (event.type) {
      case 'TRANSACTION':
        metrics.push({
          type: AnalyticsType.TRANSACTION,
          name: 'transaction_volume',
          value: event.data.amountUSD,
          metricType: MetricType.SUM,
          dimensions: {
            network: event.data.network,
            status: event.data.status
          }
        });
        metrics.push({
          type: AnalyticsType.TRANSACTION,
          name: 'transaction_count',
          value: 1,
          metricType: MetricType.COUNT,
          dimensions: {
            network: event.data.network,
            status: event.data.status
          }
        });
        break;

      case 'WALLET':
        metrics.push({
          type: AnalyticsType.WALLET,
          name: 'wallet_balance',
          value: event.data.balanceUSD,
          metricType: MetricType.AVERAGE,
          dimensions: {
            network: event.data.network
          }
        });
        break;

      case 'NOTIFICATION':
        metrics.push({
          type: AnalyticsType.NOTIFICATION,
          name: 'notification_delivery_time',
          value: event.data.deliveryTime,
          metricType: MetricType.DURATION,
          dimensions: {
            type: event.data.notificationType,
            status: event.data.status
          }
        });
        break;

      // Adicione mais casos conforme necessário
    }

    return metrics;
  }

  private async checkForAnomaly(analytics: Analytics): Promise<boolean> {
    try {
      const anomalies = await this.analyticsRepository.getAnomalies(
        analytics.type,
        analytics.name,
        this.config.anomalyThreshold
      );

      return anomalies.some(a => a.id === analytics.id);
    } catch (error) {
      this.logger.error('Error checking for anomaly', { error, analytics });
      return false;
    }
  }

  private async publishThresholdAlert(
    analytics: Analytics,
    level: 'warning' | 'critical'
  ): Promise<void> {
    try {
      await this.messageQueue.assertQueue('analytics.alerts', { durable: true });

      await this.messageQueue.publish(
        '',
        'analytics.alerts',
        Buffer.from(JSON.stringify({
          type: 'THRESHOLD_ALERT',
          level,
          analytics: {
            id: analytics.id,
            type: analytics.type,
            name: analytics.name,
            value: analytics.value,
            timestamp: analytics.timestamp
          }
        }))
      );
    } catch (error) {
      this.logger.error('Error publishing threshold alert', {
        error,
        analytics,
        level
      });
    }
  }

  private async publishAnomalyAlert(analytics: Analytics): Promise<void> {
    try {
      await this.messageQueue.assertQueue('analytics.alerts', { durable: true });

      await this.messageQueue.publish(
        '',
        'analytics.alerts',
        Buffer.from(JSON.stringify({
          type: 'ANOMALY_ALERT',
          analytics: {
            id: analytics.id,
            type: analytics.type,
            name: analytics.name,
            value: analytics.value,
            timestamp: analytics.timestamp
          }
        }))
      );
    } catch (error) {
      this.logger.error('Error publishing anomaly alert', { error, analytics });
    }
  }

  private async updateMetricCache(analytics: Analytics): Promise<void> {
    try {
      const cacheKey = `metric_summary:${analytics.type}:${analytics.name}`;
      const summary = await this.analyticsRepository.getMetricSummary(
        analytics.type,
        analytics.name
      );

      await this.redis.set(
        cacheKey,
        JSON.stringify(summary),
        'EX',
        this.config.cacheExpiration
      );
    } catch (error) {
      this.logger.error('Error updating metric cache', { error, analytics });
    }
  }
}
