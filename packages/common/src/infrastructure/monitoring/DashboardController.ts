import { Request, Response } from 'express';
import { MetricsService } from './MetricsService';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { AuthenticatedRequest } from '../middleware/rateLimitMiddleware';

export class DashboardController {
  constructor(private readonly metricsService: MetricsService) {}

  async getSystemMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = this.getTimeRange(req);

      const metrics = await this.metricsService.getMetrics(
        'system',
        startTime,
        endTime
      );

      res.status(200).json({
        metrics,
        summary: this.calculateSystemSummary(metrics)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get system metrics',
        message: error.message
      });
    }
  }

  async getServiceMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = this.getTimeRange(req);

      const metrics = await this.metricsService.getMetrics(
        'services',
        startTime,
        endTime
      );

      res.status(200).json({
        metrics,
        summary: this.calculateServiceSummary(metrics)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get service metrics',
        message: error.message
      });
    }
  }

  async getBlockchainMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = this.getTimeRange(req);

      const metrics = await this.metricsService.getMetrics(
        'blockchain',
        startTime,
        endTime
      );

      res.status(200).json({
        metrics,
        summary: this.calculateBlockchainSummary(metrics)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get blockchain metrics',
        message: error.message
      });
    }
  }

  async getDatabaseMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = this.getTimeRange(req);

      const metrics = await this.metricsService.getMetrics(
        'database',
        startTime,
        endTime
      );

      res.status(200).json({
        metrics,
        summary: this.calculateDatabaseSummary(metrics)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get database metrics',
        message: error.message
      });
    }
  }

  async getWhatsAppMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = this.getTimeRange(req);

      const metrics = await this.metricsService.getMetrics(
        'whatsapp',
        startTime,
        endTime
      );

      res.status(200).json({
        metrics,
        summary: this.calculateWhatsAppSummary(metrics)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get WhatsApp metrics',
        message: error.message
      });
    }
  }

  async getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = this.getTimeRange(req);

      const alerts = await this.metricsService.getAlerts(
        startTime,
        endTime
      );

      res.status(200).json({
        alerts,
        summary: this.calculateAlertsSummary(alerts)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get alerts',
        message: error.message
      });
    }
  }

  private getTimeRange(req: Request): { startTime: number; endTime: number } {
    const endTime = parseInt(req.query.endTime as string) || Date.now();
    const startTime = parseInt(req.query.startTime as string) || endTime - 24 * 60 * 60 * 1000;

    return { startTime, endTime };
  }

  private calculateSystemSummary(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const cpuUsage = metrics.reduce((sum, m) => sum + m.metrics.cpu.usage, 0) / metrics.length;
    const memoryUsage = metrics.reduce((sum, m) => sum + (m.metrics.memory.used / m.metrics.memory.total), 0) / metrics.length;
    const diskUsage = metrics.reduce((sum, m) => sum + (m.metrics.disk.used / m.metrics.disk.total), 0) / metrics.length;

    return {
      averageCpuUsage: cpuUsage,
      averageMemoryUsage: memoryUsage,
      averageDiskUsage: diskUsage,
      samples: metrics.length
    };
  }

  private calculateServiceSummary(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const services = new Map();

    for (const metric of metrics) {
      for (const service of metric.metrics) {
        if (!services.has(service.name)) {
          services.set(service.name, {
            errorCount: 0,
            totalRequests: 0,
            totalResponseTime: 0
          });
        }

        const stats = services.get(service.name);
        stats.errorCount += service.errorRate * service.requestRate;
        stats.totalRequests += service.requestRate;
        stats.totalResponseTime += service.responseTime;
      }
    }

    const summary = {};
    for (const [name, stats] of services.entries()) {
      summary[name] = {
        errorRate: stats.errorCount / stats.totalRequests,
        averageResponseTime: stats.totalResponseTime / metrics.length,
        requestRate: stats.totalRequests / metrics.length
      };
    }

    return summary;
  }

  private calculateBlockchainSummary(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const networks = new Map();

    for (const metric of metrics) {
      for (const networkMetrics of metric.metrics) {
        if (!networks.has(networkMetrics.network)) {
          networks.set(networkMetrics.network, {
            totalPending: 0,
            totalConfirmed: 0,
            totalFailed: 0,
            gasPrices: []
          });
        }

        const stats = networks.get(networkMetrics.network);
        stats.totalPending += networkMetrics.pendingTransactions;
        stats.totalConfirmed += networkMetrics.confirmedTransactions;
        stats.totalFailed += networkMetrics.failedTransactions;
        stats.gasPrices.push(networkMetrics.gasPrice);
      }
    }

    const summary = {};
    for (const [network, stats] of networks.entries()) {
      summary[network] = {
        averagePendingTransactions: stats.totalPending / metrics.length,
        averageConfirmedTransactions: stats.totalConfirmed / metrics.length,
        averageFailedTransactions: stats.totalFailed / metrics.length,
        averageGasPrice: stats.gasPrices.reduce((a, b) => a + parseInt(b), 0) / stats.gasPrices.length
      };
    }

    return summary;
  }

  private calculateDatabaseSummary(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const totalConnections = metrics.reduce((sum, m) => sum + m.metrics.connections, 0);
    const totalLatency = metrics.reduce((sum, m) => sum + m.metrics.queryLatency, 0);
    const totalDeadlocks = metrics.reduce((sum, m) => sum + m.metrics.deadlocks, 0);
    const totalCacheHitRate = metrics.reduce((sum, m) => sum + m.metrics.cacheHitRate, 0);

    return {
      averageConnections: totalConnections / metrics.length,
      averageLatency: totalLatency / metrics.length,
      totalDeadlocks,
      averageCacheHitRate: totalCacheHitRate / metrics.length
    };
  }

  private calculateWhatsAppSummary(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const totalSent = metrics.reduce((sum, m) => sum + m.metrics.messagesSent, 0);
    const totalDelivered = metrics.reduce((sum, m) => sum + m.metrics.messagesDelivered, 0);
    const totalDeliveryTime = metrics.reduce((sum, m) => sum + m.metrics.averageDeliveryTime, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.metrics.errorRate * m.metrics.messagesSent, 0);

    return {
      totalMessagesSent: totalSent,
      totalMessagesDelivered: totalDelivered,
      deliveryRate: totalDelivered / totalSent,
      averageDeliveryTime: totalDeliveryTime / metrics.length,
      errorRate: totalErrors / totalSent
    };
  }

  private calculateAlertsSummary(alerts: any[]): any {
    if (alerts.length === 0) return {};

    const types = new Map();
    for (const alert of alerts) {
      types.set(alert.type, (types.get(alert.type) || 0) + 1);
    }

    return {
      totalAlerts: alerts.length,
      alertsByType: Object.fromEntries(types),
      mostRecentAlert: alerts[0],
      criticalAlerts: alerts.filter(a => a.type.startsWith('HIGH_')).length
    };
  }

  setupRoutes(app: any): void {
    const router = app.Router();

    // Aplicar rate limiting
    router.use(rateLimitMiddleware);

    // Rotas de métricas
    router.get('/metrics/system', this.getSystemMetrics.bind(this));
    router.get('/metrics/services', this.getServiceMetrics.bind(this));
    router.get('/metrics/blockchain', this.getBlockchainMetrics.bind(this));
    router.get('/metrics/database', this.getDatabaseMetrics.bind(this));
    router.get('/metrics/whatsapp', this.getWhatsAppMetrics.bind(this));

    // Rota de alertas
    router.get('/alerts', this.getAlerts.bind(this));

    app.use('/api/v1/monitoring', router);
  }
}
