import Redis from 'ioredis';
import { ILogger } from '../../domain/interfaces/ILogger';
import { ICacheService } from '../../domain/interfaces/ICacheService';

export class RedisCache implements ICacheService {
  private client: Redis;
  private readonly defaultTTL = 3600; // 1 hora

  constructor(private readonly logger: ILogger) {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      autoResubscribe: true,
      autoResendUnfulfilledCommands: true,
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Se o erro for READONLY, tenta reconectar
          return true;
        }
        return false;
      }
    });

    this.client.on('connect', () => this.logger.info('Connected to Redis', { context: 'RedisCache' }));
    this.client.on('error', (err) => this.logger.error('Redis error', err.message, { context: 'RedisCache' }));
    this.client.on('ready', () => this.logger.info('Redis is ready', { context: 'RedisCache' }));
    this.client.on('reconnecting', () => this.logger.warn('Redis reconnecting', { context: 'RedisCache' }));
    this.client.on('end', () => this.logger.info('Redis connection ended', { context: 'RedisCache' }));
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error: any) {
      this.logger.error(`Error getting data from Redis for key ${key}`, error.message, { context: 'RedisCache' });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error: any) {
      this.logger.error(`Error setting data to Redis for key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error: any) {
      this.logger.error(`Error deleting data from Redis for key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
      this.logger.info('Disconnected from Redis', { context: 'RedisCache' });
    } catch (error: any) {
      this.logger.error('Error disconnecting from Redis', error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  // Métodos adicionais para operações específicas

  async increment(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error: any) {
      this.logger.error(`Error incrementing key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error: any) {
      this.logger.error(`Error decrementing key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Error checking existence of key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async setNX(key: string, value: string, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      const result = await this.client.set(key, value, 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error: any) {
      this.logger.error(`Error setting NX for key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
    const lockValue = Date.now().toString();
    return await this.setNX(`lock:${key}`, lockValue, ttl);
  }

  async releaseLock(key: string): Promise<void> {
    await this.del(`lock:${key}`);
  }

  async getClient(): Promise<Redis> {
    return this.client;
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error: any) {
      this.logger.error('Error pinging Redis', error.message, { context: 'RedisCache' });
      return false;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error: any) {
      this.logger.error('Error flushing Redis', error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error: any) {
      this.logger.error(`Error getting keys with pattern ${pattern}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error: any) {
      this.logger.error(`Error getting TTL for key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Error setting expiration for key ${key}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.client.publish(channel, message);
    } catch (error: any) {
      this.logger.error(`Error publishing message to channel ${channel}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async subscribe(channel: string, callback: (channel: string, message: string) => void): Promise<void> {
    try {
      await this.client.subscribe(channel);
      this.client.on('message', callback);
    } catch (error: any) {
      this.logger.error(`Error subscribing to channel ${channel}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.client.unsubscribe(channel);
    } catch (error: any) {
      this.logger.error(`Error unsubscribing from channel ${channel}`, error.message, { context: 'RedisCache' });
      throw error;
    }
  }
}