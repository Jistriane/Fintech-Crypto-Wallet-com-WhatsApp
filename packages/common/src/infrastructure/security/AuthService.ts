import { randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ILogger } from '../../domain/interfaces/ILogger';
import { NotusWhatsAppService } from '../whatsapp/NotusWhatsAppService';
import { KYCLevel, Session, TokenPayload } from '../../types';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<'OK'>;
  del(key: string): Promise<number>;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly redisClient: RedisClient,
    private readonly whatsappService: NotusWhatsAppService,
    private readonly logger: ILogger,
    private readonly jwtSecret: string,
    private readonly masterKey: string
  ) {}

  async validateSession(
    token: string,
    deviceId: string,
    ip: string
  ): Promise<Session | null> {
    try {
      const sessionKey = `session:${token}`;
      const sessionData = await this.redisClient.get(sessionKey);

      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData) as Session;

      if (session.deviceId !== deviceId || session.ip !== ip) {
        return null;
      }

      return session;
    } catch (error) {
      this.logger.error('Error validating session', { error });
      return null;
    }
  }

  async createSession(
    payload: TokenPayload,
    deviceId: string,
    ip: string
  ): Promise<{ token: string; expiresIn: number }> {
    try {
      const token = this.generateToken(payload);
      const session: Session = {
        userId: payload.userId,
        deviceId,
        ip,
        kycLevel: payload.kycLevel,
        phone: payload.phone,
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      const sessionKey = `session:${token}`;
      await this.redisClient.set(
        sessionKey,
        JSON.stringify(session),
        { EX: 24 * 60 * 60 } // 24 hours
      );

      return {
        token,
        expiresIn: 24 * 60 * 60,
      };
    } catch (error) {
      this.logger.error('Error creating session', { error });
      throw error;
    }
  }

  async revokeSession(token: string): Promise<boolean> {
    try {
      const sessionKey = `session:${token}`;
      const result = await this.redisClient.del(sessionKey);
      return result > 0;
    } catch (error) {
      this.logger.error('Error revoking session', { error });
      return false;
    }
  }

  async refreshSession(
    token: string,
    deviceId: string,
    ip: string
  ): Promise<{ token: string; expiresIn: number }> {
    try {
      const session = await this.validateSession(token, deviceId, ip);
      if (!session) {
        throw new Error('Invalid session');
      }

      const payload: TokenPayload = {
        userId: session.userId,
        kycLevel: session.kycLevel,
        phone: session.phone,
        sessionId: token,
      };

      await this.revokeSession(token);
      return this.createSession(payload, deviceId, ip);
    } catch (error) {
      this.logger.error('Error refreshing session', { error });
      throw error;
    }
  }

  async getUserKYCLevel(userId: string): Promise<KYCLevel> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }
      return user.kycLevel;
    } catch (error) {
      this.logger.error('Error getting user KYC level', { error });
      throw error;
    }
  }

  async hasWhatsAppOptIn(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }
      return user.whatsappOptIn;
    } catch (error) {
      this.logger.error('Error checking WhatsApp opt-in', { error });
      throw error;
    }
  }

  async hasActiveWallet(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }
      return user.wallets.some(wallet => wallet.isActive);
    } catch (error) {
      this.logger.error('Error checking active wallet', { error });
      throw error;
    }
  }

  async isWithinTransactionLimit(
    userId: string,
    amount: string
  ): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      const limit = this.getTransactionLimit(user.kycLevel);
      return parseFloat(amount) <= limit;
    } catch (error) {
      this.logger.error('Error checking transaction limit', { error });
      throw error;
    }
  }

  async generateNonce(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  private generateToken(payload: TokenPayload): string {
    return sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  private getTransactionLimit(kycLevel: KYCLevel): number {
    switch (kycLevel) {
      case KYCLevel.LEVEL_0:
        return 0;
      case KYCLevel.LEVEL_1:
        return 1000;
      case KYCLevel.LEVEL_2:
        return 10000;
      case KYCLevel.LEVEL_3:
        return 100000;
      default:
        return 0;
    }
  }

  isKYCLevelSufficient(
    currentLevel: KYCLevel,
    requiredLevel: KYCLevel
  ): boolean {
    const levels = {
      [KYCLevel.LEVEL_0]: 0,
      [KYCLevel.LEVEL_1]: 1,
      [KYCLevel.LEVEL_2]: 2,
      [KYCLevel.LEVEL_3]: 3,
    };

    return levels[currentLevel] >= levels[requiredLevel];
  }
}