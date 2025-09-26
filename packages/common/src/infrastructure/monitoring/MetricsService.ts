import { RedisCache } from '../cache/RedisCache';
import { Network } from '../../types';
import { BlockchainProvider } from '../blockchain/providers/BlockchainProvider';
import { NotusWhatsAppService } from '../../../services/kyc/src/infrastructure/whatsapp/NotusWhatsAppService';

interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
}

interface ServiceMetrics {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  errorRate: number;
  requestRate: number;
}

interface BlockchainMetrics {
  network: Network;
  blockHeight: number;
  gasPrice: string;
  pendingTransactions: number;
  confirmedTransactions: number;
  failedTransactions: number;
}

interface DatabaseMetrics {
  connections: number;
  queryLatency: number;
  activeTransactions: number;
  deadlocks: number;
  cacheHitRate: number;
}

interface WhatsAppMetrics {
  messagesSent: number;
  messagesDelivered: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  errorRate: number;
}

export class MetricsService {
  private static readonly METRICS_PREFIX = 'metrics';
  private static readonly COLLECTION_INTERVAL = 60000; // 1 minuto
  private static readonly RETENTION_PERIOD = 7 * 24 * 60 * 60; // 7 dias

  constructor(
    private readonly whatsappService: NotusWhatsAppService
  ) {
    this.startMetricsCollection();
  }

  private async startMetricsCollection(): Promise<void> {
    setInterval(async () => {
      try {
        const timestamp = Date.now();

        // Coletar métricas
        const [
          systemMetrics,
          serviceMetrics,
          blockchainMetrics,
          databaseMetrics,
          whatsappMetrics
        ] = await Promise.all([
          this.collectSystemMetrics(),
          this.collectServiceMetrics(),
          this.collectBlockchainMetrics(),
          this.collectDatabaseMetrics(),
          this.collectWhatsAppMetrics()
        ]);

        // Armazenar métricas
        await this.storeMetrics('system', timestamp, systemMetrics);
        await this.storeMetrics('services', timestamp, serviceMetrics);
        await this.storeMetrics('blockchain', timestamp, blockchainMetrics);
        await this.storeMetrics('database', timestamp, databaseMetrics);
        await this.storeMetrics('whatsapp', timestamp, whatsappMetrics);

        // Verificar alertas
        await this.checkAlerts(
          systemMetrics,
          serviceMetrics,
          blockchainMetrics,
          databaseMetrics,
          whatsappMetrics
        );
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, MetricsService.COLLECTION_INTERVAL);
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    // TODO: Implementar coleta real de métricas do sistema
    return {
      cpu: {
        usage: 0,
        load: [0, 0, 0]
      },
      memory: {
        total: 0,
        used: 0,
        free: 0
      },
      disk: {
        total: 0,
        used: 0,
        free: 0
      }
    };
  }

  private async collectServiceMetrics(): Promise<ServiceMetrics[]> {
    // TODO: Implementar coleta real de métricas dos serviços
    return [];
  }

  private async collectBlockchainMetrics(): Promise<BlockchainMetrics[]> {
    const networks: Network[] = ['POLYGON', 'BSC'];
    const metrics = [];

    for (const network of networks) {
      const provider = BlockchainProvider.getProvider(network);
      
      const [
        blockHeight,
        gasPrice,
        pendingTransactions
      ] = await Promise.all([
        provider.getBlockNumber(),
        provider.getGasPrice(),
        this.getPendingTransactions(network)
      ]);

      metrics.push({
        network,
        blockHeight,
        gasPrice: gasPrice.toString(),
        pendingTransactions,
        confirmedTransactions: 0, // TODO: Implementar
        failedTransactions: 0 // TODO: Implementar
      });
    }

    return metrics;
  }

  private async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    // TODO: Implementar coleta real de métricas do banco de dados
    return {
      connections: 0,
      queryLatency: 0,
      activeTransactions: 0,
      deadlocks: 0,
      cacheHitRate: 0
    };
  }

  private async collectWhatsAppMetrics(): Promise<WhatsAppMetrics> {
    // TODO: Implementar coleta real de métricas do WhatsApp
    return {
      messagesSent: 0,
      messagesDelivered: 0,
      deliveryRate: 0,
      averageDeliveryTime: 0,
      errorRate: 0
    };
  }

  private async storeMetrics(
    type: string,
    timestamp: number,
    metrics: any
  ): Promise<void> {
    const key = RedisCache.generateKey(
      MetricsService.METRICS_PREFIX,
      type,
      Math.floor(timestamp / MetricsService.COLLECTION_INTERVAL).toString()
    );

    await RedisCache.set(
      key,
      {
        timestamp,
        metrics
      },
      MetricsService.RETENTION_PERIOD
    );
  }

  private async checkAlerts(
    systemMetrics: SystemMetrics,
    serviceMetrics: ServiceMetrics[],
    blockchainMetrics: BlockchainMetrics[],
    databaseMetrics: DatabaseMetrics,
    whatsappMetrics: WhatsAppMetrics
  ): Promise<void> {
    // Verificar métricas do sistema
    if (systemMetrics.cpu.usage > 80) {
      await this.triggerAlert('HIGH_CPU_USAGE', systemMetrics.cpu);
    }

    if (systemMetrics.memory.free / systemMetrics.memory.total < 0.2) {
      await this.triggerAlert('LOW_MEMORY', systemMetrics.memory);
    }

    if (systemMetrics.disk.free / systemMetrics.disk.total < 0.1) {
      await this.triggerAlert('LOW_DISK_SPACE', systemMetrics.disk);
    }

    // Verificar métricas dos serviços
    for (const service of serviceMetrics) {
      if (service.status === 'unhealthy') {
        await this.triggerAlert('SERVICE_UNHEALTHY', service);
      }

      if (service.errorRate > 0.05) {
        await this.triggerAlert('HIGH_ERROR_RATE', service);
      }

      if (service.responseTime > 1000) {
        await this.triggerAlert('HIGH_LATENCY', service);
      }
    }

    // Verificar métricas blockchain
    for (const metrics of blockchainMetrics) {
      if (metrics.pendingTransactions > 1000) {
        await this.triggerAlert('HIGH_PENDING_TRANSACTIONS', metrics);
      }

      if (metrics.failedTransactions > 100) {
        await this.triggerAlert('HIGH_FAILED_TRANSACTIONS', metrics);
      }
    }

    // Verificar métricas do banco de dados
    if (databaseMetrics.connections > 100) {
      await this.triggerAlert('HIGH_DB_CONNECTIONS', databaseMetrics);
    }

    if (databaseMetrics.queryLatency > 1000) {
      await this.triggerAlert('HIGH_DB_LATENCY', databaseMetrics);
    }

    if (databaseMetrics.deadlocks > 0) {
      await this.triggerAlert('DB_DEADLOCKS', databaseMetrics);
    }

    // Verificar métricas do WhatsApp
    if (whatsappMetrics.deliveryRate < 0.95) {
      await this.triggerAlert('LOW_WHATSAPP_DELIVERY_RATE', whatsappMetrics);
    }

    if (whatsappMetrics.errorRate > 0.05) {
      await this.triggerAlert('HIGH_WHATSAPP_ERROR_RATE', whatsappMetrics);
    }
  }

  private async triggerAlert(
    type: string,
    data: any
  ): Promise<void> {
    const alert = {
      type,
      data,
      timestamp: Date.now()
    };

    // Armazenar alerta
    const key = RedisCache.generateKey('alerts', type, Date.now().toString());
    await RedisCache.set(key, alert);

    // Notificar equipe de operações
    // TODO: Implementar notificação real
    console.log('Alert triggered:', alert);
  }

  async getMetrics(
    type: string,
    startTime: number,
    endTime: number
  ): Promise<any[]> {
    const pattern = RedisCache.generateKey(
      MetricsService.METRICS_PREFIX,
      type,
      '*'
    );

    const keys = await RedisCache.getInstance().keys(pattern);
    const metrics = [];

    for (const key of keys) {
      const data = await RedisCache.get(key);
      if (
        data &&
        data.timestamp >= startTime &&
        data.timestamp <= endTime
      ) {
        metrics.push(data);
      }
    }

    return metrics.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getAlerts(
    startTime: number,
    endTime: number
  ): Promise<any[]> {
    const pattern = RedisCache.generateKey('alerts', '*');
    const keys = await RedisCache.getInstance().keys(pattern);
    const alerts = [];

    for (const key of keys) {
      const alert = await RedisCache.get(key);
      if (
        alert &&
        alert.timestamp >= startTime &&
        alert.timestamp <= endTime
      ) {
        alerts.push(alert);
      }
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  private async getPendingTransactions(network: Network): Promise<number> {
    // TODO: Implementar contagem real de transações pendentes
    return 0;
  }
}
