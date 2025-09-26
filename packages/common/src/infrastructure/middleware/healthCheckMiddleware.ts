import { Request, Response, NextFunction } from 'express';
import { HealthCheck, HealthStatus } from '../monitoring/HealthCheck';
import { RedisCache } from '../cache/RedisCache';

export class HealthCheckMiddleware {
  private static readonly CACHE_KEY = 'health_status';
  private static readonly CACHE_TTL = 30; // 30 segundos
  private static readonly DEGRADED_THRESHOLD = 0.8; // 80% dos checks precisam estar saudáveis

  constructor(private readonly healthCheck: HealthCheck) {}

  handleHealthCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cachedStatus = await this.getCachedStatus();
      
      if (cachedStatus) {
        res.status(this.getStatusCode(cachedStatus.status)).json(cachedStatus);
        return;
      }

      const status = await this.healthCheck.checkHealth();
      await this.cacheStatus(status);

      res.status(this.getStatusCode(status.status)).json(status);
    } catch (error) {
      next(error);
    }
  };

  handleLivenessCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Verificação simples para garantir que o serviço está respondendo
      res.status(200).json({ status: 'alive' });
    } catch (error) {
      next(error);
    }
  };

  handleReadinessCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const status = await this.healthCheck.checkHealth();
      const isReady = status.status !== 'unhealthy';

      res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not_ready',
        details: status.details
      });
    } catch (error) {
      next(error);
    }
  };

  private async getCachedStatus(): Promise<HealthStatus | null> {
    return await RedisCache.get<HealthStatus>(HealthCheckMiddleware.CACHE_KEY);
  }

  private async cacheStatus(status: HealthStatus): Promise<void> {
    await RedisCache.set(
      HealthCheckMiddleware.CACHE_KEY,
      status,
      HealthCheckMiddleware.CACHE_TTL
    );
  }

  private getStatusCode(status: HealthStatus['status']): number {
    switch (status) {
      case 'healthy':
        return 200;
      case 'degraded':
        return 200; // Ainda está funcionando, mas com performance reduzida
      case 'unhealthy':
        return 503;
      default:
        return 500;
    }
  }

  setupRoutes(app: any): void {
    const router = app.Router();

    router.get('/health', this.handleHealthCheck);
    router.get('/health/live', this.handleLivenessCheck);
    router.get('/health/ready', this.handleReadinessCheck);

    app.use('/', router);
  }
}
