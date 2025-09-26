import { RedisCache } from '../cache/RedisCache';
import { WhatsAppPriority } from '../../types';
import { WHATSAPP_SLA } from '../../constants/kyc';

interface NotificationMetrics {
  sentAt: number;
  deliveredAt?: number;
  retryCount: number;
  priority: WhatsAppPriority;
  escalated: boolean;
}

export class WhatsAppSLAMonitor {
  private static readonly METRICS_PREFIX = 'whatsapp:metrics';
  private static readonly SLA_VIOLATIONS_PREFIX = 'whatsapp:sla:violations';

  private static generateMetricsKey(notificationId: string): string {
    return RedisCache.generateKey(WhatsAppSLAMonitor.METRICS_PREFIX, notificationId);
  }

  private static generateViolationsKey(date: string): string {
    return RedisCache.generateKey(WhatsAppSLAMonitor.SLA_VIOLATIONS_PREFIX, date);
  }

  static async trackNotificationSent(
    notificationId: string,
    priority: WhatsAppPriority
  ): Promise<void> {
    const metrics: NotificationMetrics = {
      sentAt: Date.now(),
      priority,
      retryCount: 0,
      escalated: false
    };

    await RedisCache.set(
      WhatsAppSLAMonitor.generateMetricsKey(notificationId),
      metrics,
      24 * 3600 // 24 horas
    );
  }

  static async trackNotificationDelivered(notificationId: string): Promise<void> {
    const key = WhatsAppSLAMonitor.generateMetricsKey(notificationId);
    const metrics = await RedisCache.get<NotificationMetrics>(key);

    if (metrics) {
      metrics.deliveredAt = Date.now();
      await RedisCache.set(key, metrics);
    }
  }

  static async trackRetry(notificationId: string): Promise<void> {
    const key = WhatsAppSLAMonitor.generateMetricsKey(notificationId);
    const metrics = await RedisCache.get<NotificationMetrics>(key);

    if (metrics) {
      metrics.retryCount++;
      await RedisCache.set(key, metrics);
    }
  }

  static async trackEscalation(notificationId: string): Promise<void> {
    const key = WhatsAppSLAMonitor.generateMetricsKey(notificationId);
    const metrics = await RedisCache.get<NotificationMetrics>(key);

    if (metrics) {
      metrics.escalated = true;
      await RedisCache.set(key, metrics);
    }
  }

  static async checkSLA(notificationId: string): Promise<{
    isViolated: boolean;
    shouldEscalate: boolean;
    timeSinceNotification: number;
  }> {
    const metrics = await RedisCache.get<NotificationMetrics>(
      WhatsAppSLAMonitor.generateMetricsKey(notificationId)
    );

    if (!metrics) {
      return { isViolated: false, shouldEscalate: false, timeSinceNotification: 0 };
    }

    const now = Date.now();
    const timeSinceNotification = now - metrics.sentAt;
    const sla = WHATSAPP_SLA[metrics.priority];

    // Verificar violação de SLA
    const isViolated = timeSinceNotification > sla.targetDelivery;

    // Verificar necessidade de escalonamento
    const shouldEscalate = isViolated && 
      !metrics.escalated && 
      metrics.retryCount >= sla.maxRetries;

    // Registrar violação se necessário
    if (isViolated) {
      await WhatsAppSLAMonitor.recordSLAViolation(metrics.priority);
    }

    return { isViolated, shouldEscalate, timeSinceNotification };
  }

  private static async recordSLAViolation(priority: WhatsAppPriority): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const key = WhatsAppSLAMonitor.generateViolationsKey(date);
    
    await RedisCache.getInstance().hincrby(key, priority, 1);
  }

  static async getQualityMetrics(date: string): Promise<{
    violations: Record<WhatsAppPriority, number>;
    totalViolations: number;
  }> {
    const key = WhatsAppSLAMonitor.generateViolationsKey(date);
    const violations = await RedisCache.getInstance().hgetall(key);
    
    const metrics = {
      violations: {
        CRITICAL: parseInt(violations.CRITICAL || '0'),
        HIGH: parseInt(violations.HIGH || '0'),
        MEDIUM: parseInt(violations.MEDIUM || '0'),
        LOW: parseInt(violations.LOW || '0')
      },
      totalViolations: 0
    };

    metrics.totalViolations = Object.values(metrics.violations)
      .reduce((sum, count) => sum + count, 0);

    return metrics;
  }

  static async getDeliveryRate(timeWindowMs: number = 3600000): Promise<number> {
    const now = Date.now();
    const pattern = `${WhatsAppSLAMonitor.METRICS_PREFIX}:*`;
    const redis = RedisCache.getInstance();
    
    const keys = await redis.keys(pattern);
    const metrics = await Promise.all(
      keys.map(key => RedisCache.get<NotificationMetrics>(key))
    );

    const recentMetrics = metrics.filter(m => m && (now - m.sentAt) <= timeWindowMs);
    
    if (recentMetrics.length === 0) return 100;

    const delivered = recentMetrics.filter(m => m?.deliveredAt).length;
    return (delivered / recentMetrics.length) * 100;
  }

  static async getAverageDeliveryTime(priority: WhatsAppPriority): Promise<number> {
    const pattern = `${WhatsAppSLAMonitor.METRICS_PREFIX}:*`;
    const redis = RedisCache.getInstance();
    
    const keys = await redis.keys(pattern);
    const metrics = await Promise.all(
      keys.map(key => RedisCache.get<NotificationMetrics>(key))
    );

    const deliveredMetrics = metrics.filter(
      m => m?.priority === priority && m?.deliveredAt
    );

    if (deliveredMetrics.length === 0) return 0;

    const totalTime = deliveredMetrics.reduce(
      (sum, m) => sum + (m!.deliveredAt! - m!.sentAt),
      0
    );

    return totalTime / deliveredMetrics.length;
  }
}
