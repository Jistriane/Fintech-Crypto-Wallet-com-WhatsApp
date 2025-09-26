import { RedisCache } from '../cache/RedisCache';
import { BlockchainProvider } from '../blockchain/providers/BlockchainProvider';
import { Network } from '../../types';
import { DataSource } from 'typeorm';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  details: {
    database: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
    };
    cache: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
    };
    blockchain: {
      [key in Network]: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        blockHeight?: number;
      };
    };
    dependencies: {
      [key: string]: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
      };
    };
  };
  timestamp: Date;
}

export class HealthCheck {
  constructor(private readonly dataSource: DataSource) {}

  async checkHealth(): Promise<HealthStatus> {
    const [
      databaseHealth,
      cacheHealth,
      blockchainHealth,
      dependenciesHealth
    ] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
      this.checkBlockchain(),
      this.checkDependencies()
    ]);

    const status = this.determineOverallStatus({
      database: databaseHealth,
      cache: cacheHealth,
      blockchain: blockchainHealth,
      dependencies: dependenciesHealth
    });

    return {
      status,
      details: {
        database: databaseHealth,
        cache: cacheHealth,
        blockchain: blockchainHealth,
        dependencies: dependenciesHealth
      },
      timestamp: new Date()
    };
  }

  private async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    const start = Date.now();
    
    try {
      if (!this.dataSource.isInitialized) {
        return { status: 'unhealthy' };
      }

      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - start;

      return {
        status: latency < 1000 ? 'healthy' : 'unhealthy',
        latency
      };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }

  private async checkCache(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    const start = Date.now();
    
    try {
      const redis = RedisCache.getInstance();
      await redis.ping();
      const latency = Date.now() - start;

      return {
        status: latency < 100 ? 'healthy' : 'unhealthy',
        latency
      };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }

  private async checkBlockchain(): Promise<{
    [key in Network]: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      blockHeight?: number;
    };
  }> {
    const networks: Network[] = ['POLYGON', 'BSC'];
    const results: any = {};

    for (const network of networks) {
      const start = Date.now();
      
      try {
        const provider = BlockchainProvider.getProvider(network);
        const blockNumber = await provider.getBlockNumber();
        const latency = Date.now() - start;

        results[network] = {
          status: latency < 2000 ? 'healthy' : 'unhealthy',
          latency,
          blockHeight: blockNumber
        };
      } catch (error) {
        results[network] = { status: 'unhealthy' };
      }
    }

    return results;
  }

  private async checkDependencies(): Promise<{
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
    };
  }> {
    // TODO: Implementar checks para outros serviços externos
    // Por exemplo: Notus API, serviços de KYC, etc.
    return {
      notus: await this.checkNotusAPI(),
      kycProvider: await this.checkKYCProvider()
    };
  }

  private async checkNotusAPI(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    // TODO: Implementar check real da API Notus
    return { status: 'healthy', latency: 50 };
  }

  private async checkKYCProvider(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
    // TODO: Implementar check real do provedor de KYC
    return { status: 'healthy', latency: 100 };
  }

  private determineOverallStatus(details: HealthStatus['details']): HealthStatus['status'] {
    const unhealthyServices = [];
    let degradedServices = 0;

    // Verificar banco de dados
    if (details.database.status === 'unhealthy') {
      unhealthyServices.push('database');
    } else if (details.database.latency! > 500) {
      degradedServices++;
    }

    // Verificar cache
    if (details.cache.status === 'unhealthy') {
      unhealthyServices.push('cache');
    } else if (details.cache.latency! > 50) {
      degradedServices++;
    }

    // Verificar blockchains
    Object.entries(details.blockchain).forEach(([network, health]) => {
      if (health.status === 'unhealthy') {
        unhealthyServices.push(`blockchain_${network}`);
      } else if (health.latency! > 1000) {
        degradedServices++;
      }
    });

    // Verificar dependências
    Object.entries(details.dependencies).forEach(([service, health]) => {
      if (health.status === 'unhealthy') {
        unhealthyServices.push(service);
      } else if (health.latency! > 200) {
        degradedServices++;
      }
    });

    // Determinar status geral
    if (unhealthyServices.length > 0) {
      return 'unhealthy';
    }

    if (degradedServices > 0) {
      return 'degraded';
    }

    return 'healthy';
  }
}
