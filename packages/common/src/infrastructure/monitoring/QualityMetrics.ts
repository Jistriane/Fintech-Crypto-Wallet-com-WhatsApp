import { RedisCache } from '../cache/RedisCache';
import { WhatsAppPriority } from '../../types';

interface MetricWindow {
  start: number;
  end: number;
  count: number;
  sum: number;
}

export class QualityMetrics {
  private static readonly METRICS_PREFIX = 'metrics';
  private static readonly WINDOWS = {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
  };

  private static generateKey(metric: string, window: string): string {
    return RedisCache.generateKey(
      QualityMetrics.METRICS_PREFIX,
      metric,
      window,
      Math.floor(Date.now() / QualityMetrics.WINDOWS[window as keyof typeof QualityMetrics.WINDOWS]).toString()
    );
  }

  static async trackDeliveryTime(priority: WhatsAppPriority, timeMs: number): Promise<void> {
    const windows = Object.keys(QualityMetrics.WINDOWS);
    
    for (const window of windows) {
      const key = QualityMetrics.generateKey(`delivery_time:${priority}`, window);
      const metrics = await RedisCache.get<MetricWindow>(key) || {
        start: Date.now(),
        end: Date.now() + QualityMetrics.WINDOWS[window as keyof typeof QualityMetrics.WINDOWS],
        count: 0,
        sum: 0
      };

      metrics.count++;
      metrics.sum += timeMs;

      await RedisCache.set(key, metrics);
    }
  }

  static async trackDeliverySuccess(priority: WhatsAppPriority): Promise<void> {
    const windows = Object.keys(QualityMetrics.WINDOWS);
    
    for (const window of windows) {
      const key = QualityMetrics.generateKey(`delivery_success:${priority}`, window);
      const count = await RedisCache.getInstance().incr(key);
      
      if (count === 1) {
        await RedisCache.getInstance().expire(
          key,
          QualityMetrics.WINDOWS[window as keyof typeof QualityMetrics.WINDOWS] / 1000
        );
      }
    }
  }

  static async trackDeliveryFailure(priority: WhatsAppPriority): Promise<void> {
    const windows = Object.keys(QualityMetrics.WINDOWS);
    
    for (const window of windows) {
      const key = QualityMetrics.generateKey(`delivery_failure:${priority}`, window);
      const count = await RedisCache.getInstance().incr(key);
      
      if (count === 1) {
        await RedisCache.getInstance().expire(
          key,
          QualityMetrics.WINDOWS[window as keyof typeof QualityMetrics.WINDOWS] / 1000
        );
      }
    }
  }

  static async getDeliveryRate(
    priority: WhatsAppPriority,
    window: keyof typeof QualityMetrics.WINDOWS
  ): Promise<number> {
    const successKey = QualityMetrics.generateKey(`delivery_success:${priority}`, window);
    const failureKey = QualityMetrics.generateKey(`delivery_failure:${priority}`, window);

    const [successes, failures] = await Promise.all([
      RedisCache.getInstance().get(successKey),
      RedisCache.getInstance().get(failureKey)
    ]);

    const total = parseInt(successes || '0') + parseInt(failures || '0');
    if (total === 0) return 100;

    return (parseInt(successes || '0') / total) * 100;
  }

  static async getAverageDeliveryTime(
    priority: WhatsAppPriority,
    window: keyof typeof QualityMetrics.WINDOWS
  ): Promise<number> {
    const key = QualityMetrics.generateKey(`delivery_time:${priority}`, window);
    const metrics = await RedisCache.get<MetricWindow>(key);

    if (!metrics || metrics.count === 0) return 0;
    return metrics.sum / metrics.count;
  }

  static async getP95DeliveryTime(
    priority: WhatsAppPriority,
    window: keyof typeof QualityMetrics.WINDOWS
  ): Promise<number> {
    const key = QualityMetrics.generateKey(`delivery_time:${priority}`, window);
    const metrics = await RedisCache.get<MetricWindow>(key);

    if (!metrics || metrics.count === 0) return 0;
    
    // Para um cálculo mais preciso do P95, precisaríamos armazenar todos os valores
    // Esta é uma aproximação baseada na média e desvio padrão
    return metrics.sum / metrics.count * 1.645; // Aproximação usando distribuição normal
  }

  static async getQualityReport(): Promise<{
    deliveryRates: Record<WhatsAppPriority, number>;
    averageDeliveryTimes: Record<WhatsAppPriority, number>;
    p95DeliveryTimes: Record<WhatsAppPriority, number>;
  }> {
    const priorities: WhatsAppPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    
    const report = {
      deliveryRates: {} as Record<WhatsAppPriority, number>,
      averageDeliveryTimes: {} as Record<WhatsAppPriority, number>,
      p95DeliveryTimes: {} as Record<WhatsAppPriority, number>
    };

    for (const priority of priorities) {
      const [rate, avgTime, p95Time] = await Promise.all([
        QualityMetrics.getDeliveryRate(priority, 'HOUR'),
        QualityMetrics.getAverageDeliveryTime(priority, 'HOUR'),
        QualityMetrics.getP95DeliveryTime(priority, 'HOUR')
      ]);

      report.deliveryRates[priority] = rate;
      report.averageDeliveryTimes[priority] = avgTime;
      report.p95DeliveryTimes[priority] = p95Time;
    }

    return report;
  }
}
