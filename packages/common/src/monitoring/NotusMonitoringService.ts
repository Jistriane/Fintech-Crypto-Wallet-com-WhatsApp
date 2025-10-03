import { ILogger } from '../interfaces/ILogger';
import { MetricsService } from '../monitoring/MetricsService';
import { NotificationStatus, MessageType } from '../types/enums';

export interface MonitoringMetrics {
  messageSent: number;
  messageDelivered: number;
  messageRead: number;
  messageFailed: number;
  averageDeliveryTime: number;
  webhooksReceived: number;
  errorsCount: number;
}

export class NotusMonitoringService {
  private metrics: Map<string, MonitoringMetrics>;

  constructor(
    private readonly logger: ILogger,
    private readonly metricsService: MetricsService
  ) {
    this.metrics = new Map();
  }

  // Rastreamento de mensagens
  trackMessageSent(templateId: string, priority: string, messageType: MessageType) {
    this.metricsService.increment('notus.messages.sent', {
      template: templateId,
      priority,
      type: messageType
    });

    this.updateMetrics(templateId, 'messageSent');
    this.logger.info('Message sent', { templateId, priority, messageType });
  }

  trackMessageStatus(messageId: string, status: NotificationStatus, templateId?: string) {
    this.metricsService.increment('notus.messages.status', {
      messageId,
      status
    });

    if (templateId) {
      switch (status) {
        case NotificationStatus.DELIVERED:
          this.updateMetrics(templateId, 'messageDelivered');
          break;
        case NotificationStatus.READ:
          this.updateMetrics(templateId, 'messageRead');
          break;
        case NotificationStatus.FAILED:
          this.updateMetrics(templateId, 'messageFailed');
          break;
      }
    }

    this.logger.info('Message status updated', { messageId, status, templateId });
  }

  trackDeliveryTime(messageId: string, deliveryTime: number, templateId?: string) {
    this.metricsService.histogram('notus.messages.delivery_time', deliveryTime, {
      messageId
    });

    if (templateId) {
      const metrics = this.getMetrics(templateId);
      metrics.averageDeliveryTime = this.calculateNewAverage(
        metrics.averageDeliveryTime,
        deliveryTime,
        metrics.messageDelivered
      );
      this.metrics.set(templateId, metrics);
    }

    this.logger.info('Message delivery time tracked', { messageId, deliveryTime, templateId });
  }

  // Rastreamento de erros
  trackError(type: string, error: Error, context: Record<string, any> = {}) {
    this.metricsService.increment('notus.errors', {
      type,
      errorCode: error.name,
      errorMessage: error.message
    });

    this.logger.error('Notus error occurred', {
      type,
      error: error.message,
      stack: error.stack,
      ...context
    });
  }

  // Rastreamento de webhooks
  trackWebhookReceived(type: string, status: string, processingTime: number) {
    this.metricsService.increment('notus.webhooks.received', {
      type,
      status
    });

    this.metricsService.histogram('notus.webhooks.processing_time', processingTime, {
      type
    });

    this.logger.info('Webhook received', { type, status, processingTime });
  }

  // Rastreamento de API
  trackApiLatency(endpoint: string, duration: number, status: number) {
    this.metricsService.histogram('notus.api.latency', duration, {
      endpoint,
      status: status.toString()
    });

    if (duration > 1000) { // Alerta se a latência for maior que 1s
      this.logger.warn('High API latency detected', {
        endpoint,
        duration,
        status
      });
    }
  }

  // Rastreamento de rate limiting
  trackRateLimitHit(endpoint: string, limit: number, windowMs: number) {
    this.metricsService.increment('notus.rate_limit.hits', {
      endpoint,
      limit: limit.toString(),
      window: (windowMs / 1000).toString() + 's'
    });

    this.logger.warn('Rate limit hit', { endpoint, limit, windowMs });
  }

  // Métricas de template
  getTemplateMetrics(templateId: string): MonitoringMetrics {
    return this.getMetrics(templateId);
  }

  // Métodos auxiliares
  private getMetrics(templateId: string): MonitoringMetrics {
    if (!this.metrics.has(templateId)) {
      this.metrics.set(templateId, {
        messageSent: 0,
        messageDelivered: 0,
        messageRead: 0,
        messageFailed: 0,
        averageDeliveryTime: 0,
        webhooksReceived: 0,
        errorsCount: 0
      });
    }
    return this.metrics.get(templateId)!;
  }

  private updateMetrics(templateId: string, metric: keyof MonitoringMetrics) {
    const metrics = this.getMetrics(templateId);
    if (typeof metrics[metric] === 'number') {
      metrics[metric] = (metrics[metric] as number) + 1;
      this.metrics.set(templateId, metrics);
    }
  }

  private calculateNewAverage(oldAvg: number, newValue: number, count: number): number {
    return (oldAvg * (count - 1) + newValue) / count;
  }

  // Exportar métricas
  async exportMetrics(): Promise<Record<string, MonitoringMetrics>> {
    const metricsExport: Record<string, MonitoringMetrics> = {};
    this.metrics.forEach((value, key) => {
      metricsExport[key] = { ...value };
    });
    return metricsExport;
  }
}