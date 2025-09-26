import { RedisCache } from '../cache/RedisCache';
import { KYCLevel } from '../../types';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private static readonly DEFAULT_WINDOW_MS = 3600000; // 1 hora
  private static readonly RATE_LIMITS: Record<KYCLevel, RateLimitConfig> = {
    LEVEL_0: {
      windowMs: RateLimiter.DEFAULT_WINDOW_MS,
      maxRequests: 10 // 10 requisições por hora
    },
    LEVEL_1: {
      windowMs: RateLimiter.DEFAULT_WINDOW_MS,
      maxRequests: 50 // 50 requisições por hora
    },
    LEVEL_2: {
      windowMs: RateLimiter.DEFAULT_WINDOW_MS,
      maxRequests: 200 // 200 requisições por hora
    },
    LEVEL_3: {
      windowMs: RateLimiter.DEFAULT_WINDOW_MS,
      maxRequests: 1000 // 1000 requisições por hora
    }
  };

  private static readonly ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
    '/swap': {
      windowMs: 60000, // 1 minuto
      maxRequests: 1000
    },
    '/transfer': {
      windowMs: 60000,
      maxRequests: 500
    },
    '/portfolio': {
      windowMs: 60000,
      maxRequests: 2000
    }
  };

  private static readonly WHATSAPP_LIMITS = {
    perUser: {
      windowMs: RateLimiter.DEFAULT_WINDOW_MS,
      maxRequests: 50 // 50 mensagens por hora
    },
    global: {
      windowMs: RateLimiter.DEFAULT_WINDOW_MS,
      maxRequests: 100000 // 100,000 mensagens por hora
    }
  };

  private static async incrementCounter(key: string, windowMs: number): Promise<number> {
    const redis = RedisCache.getInstance();
    const multi = redis.multi();

    multi.incr(key);
    multi.pexpire(key, windowMs);

    const results = await multi.exec();
    return results ? (results[0][1] as number) : 0;
  }

  static async checkUserRateLimit(userId: string, kycLevel: KYCLevel): Promise<boolean> {
    const limits = RateLimiter.RATE_LIMITS[kycLevel];
    const key = `rate_limit:user:${userId}:${Math.floor(Date.now() / limits.windowMs)}`;
    
    const count = await RateLimiter.incrementCounter(key, limits.windowMs);
    return count <= limits.maxRequests;
  }

  static async checkEndpointRateLimit(endpoint: string, ip: string): Promise<boolean> {
    const limits = RateLimiter.ENDPOINT_LIMITS[endpoint] || {
      windowMs: 60000,
      maxRequests: 100 // Limite padrão
    };

    const key = `rate_limit:endpoint:${endpoint}:${ip}:${Math.floor(Date.now() / limits.windowMs)}`;
    
    const count = await RateLimiter.incrementCounter(key, limits.windowMs);
    return count <= limits.maxRequests;
  }

  static async checkWhatsAppUserRateLimit(phone: string): Promise<boolean> {
    const limits = RateLimiter.WHATSAPP_LIMITS.perUser;
    const key = `rate_limit:whatsapp:user:${phone}:${Math.floor(Date.now() / limits.windowMs)}`;
    
    const count = await RateLimiter.incrementCounter(key, limits.windowMs);
    return count <= limits.maxRequests;
  }

  static async checkWhatsAppGlobalRateLimit(): Promise<boolean> {
    const limits = RateLimiter.WHATSAPP_LIMITS.global;
    const key = `rate_limit:whatsapp:global:${Math.floor(Date.now() / limits.windowMs)}`;
    
    const count = await RateLimiter.incrementCounter(key, limits.windowMs);
    return count <= limits.maxRequests;
  }

  static async getRemainingRequests(key: string): Promise<number> {
    const redis = RedisCache.getInstance();
    const count = await redis.get(key);
    return count ? parseInt(count) : 0;
  }

  static async resetLimits(userId: string): Promise<void> {
    const redis = RedisCache.getInstance();
    const pattern = `rate_limit:user:${userId}:*`;
    
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
