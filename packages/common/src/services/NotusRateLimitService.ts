import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../interfaces/ILogger';
import { NotusMonitoringService } from '../monitoring/NotusMonitoringService';
import { NOTUS_CONFIG } from '../config/notus';
import { ErrorType } from '../types/enums';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}

export class NotusRateLimitService {
  private requestCounts: Map<string, number>;
  private resetTimers: Map<string, NodeJS.Timeout>;

  constructor(
    private readonly logger: ILogger,
    private readonly monitoring: NotusMonitoringService
  ) {
    this.requestCounts = new Map();
    this.resetTimers = new Map();
  }

  createLimiter(options: RateLimitOptions) {
    const {
      windowMs,
      max,
      keyGenerator = (req: Request) => req.ip
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      const key = keyGenerator(req);
      const now = Date.now();

      // Inicializa ou atualiza o contador
      if (!this.requestCounts.has(key)) {
        this.requestCounts.set(key, 0);
        this.setupResetTimer(key, windowMs);
      }

      const currentCount = this.requestCounts.get(key)!;
      const limitInfo: RateLimitInfo = {
        limit: max,
        current: currentCount,
        remaining: Math.max(0, max - currentCount),
        resetTime: now + windowMs
      };

      // Adiciona headers com informações do rate limit
      res.set({
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': limitInfo.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(limitInfo.resetTime / 1000).toString()
      });

      if (currentCount >= max) {
        this.monitoring.trackRateLimitHit(req.path, max, windowMs);
        this.logger.warn('Rate limit exceeded', {
          path: req.path,
          ip: req.ip,
          limit: max,
          window: windowMs
        });

        res.status(429).json({
          error: {
            type: ErrorType.RATE_LIMIT,
            message: 'Too many requests',
            retryAfter: Math.ceil(windowMs / 1000)
          }
        });
        return;
      }

      // Incrementa o contador
      this.requestCounts.set(key, currentCount + 1);
      next();
    };
  }

  private setupResetTimer(key: string, windowMs: number) {
    // Limpa timer existente se houver
    if (this.resetTimers.has(key)) {
      clearTimeout(this.resetTimers.get(key));
    }

    // Cria novo timer para resetar o contador
    const timer = setTimeout(() => {
      this.requestCounts.delete(key);
      this.resetTimers.delete(key);
    }, windowMs);

    this.resetTimers.set(key, timer);
  }

  // Middleware para limitar mensagens
  messageRateLimit() {
    return this.createLimiter(NOTUS_CONFIG.RATE_LIMITS.MESSAGES);
  }

  // Middleware para limitar webhooks
  webhookRateLimit() {
    return this.createLimiter(NOTUS_CONFIG.RATE_LIMITS.WEBHOOKS);
  }

  // Retorna informações sobre o rate limit atual
  getRateLimitInfo(key: string): RateLimitInfo | null {
    if (!this.requestCounts.has(key)) {
      return null;
    }

    const currentCount = this.requestCounts.get(key)!;
    const { max, windowMs } = NOTUS_CONFIG.RATE_LIMITS.MESSAGES;

    return {
      limit: max,
      current: currentCount,
      remaining: Math.max(0, max - currentCount),
      resetTime: Date.now() + windowMs
    };
  }

  // Limpa todos os contadores e timers
  clearAll() {
    this.resetTimers.forEach(timer => clearTimeout(timer));
    this.resetTimers.clear();
    this.requestCounts.clear();
  }
}