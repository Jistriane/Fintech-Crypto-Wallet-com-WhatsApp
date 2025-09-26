import { IUserRepository } from '../repositories/IUserRepository';
import { User, UserStatus } from '../entities/User';
import { INotificationService, ILogger } from '@fintech/common';
import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { randomBytes } from 'crypto';

export interface AuthServiceConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  verificationCodeExpiresIn: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly notificationService: INotificationService,
    private readonly redis: Redis,
    private readonly logger: ILogger,
    private readonly config: AuthServiceConfig
  ) {}

  async register(userData: {
    phone: string;
    email: string;
    password: string;
  }): Promise<{ user: User; verificationCode: string }> {
    try {
      // Verifica se usuário já existe
      const existingUser = await this.userRepository.findByPhone(userData.phone);
      if (existingUser) {
        throw new Error('Phone number already registered');
      }

      const existingEmail = await this.userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already registered');
      }

      // Hash da senha
      const hashedPassword = await hash(userData.password, 12);

      // Cria usuário
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
        status: UserStatus.PENDING
      });

      // Gera código de verificação
      const verificationCode = await this.generateVerificationCode(user.id);

      // Envia código via WhatsApp
      await this.notificationService.sendWhatsAppMessage(user.phone, {
        type: 'verification_code',
        template: 'phone_verification',
        parameters: [verificationCode]
      });

      return { user, verificationCode };
    } catch (error) {
      this.logger.error('Error in user registration', { error, userData });
      throw error;
    }
  }

  async login(phone: string, password: string, deviceInfo?: any): Promise<{
    accessToken: string;
    refreshToken: string;
    tempSessionId?: string;
  }> {
    try {
      // Verifica tentativas de login
      const attempts = await this.getLoginAttempts(phone);
      if (attempts >= this.config.maxLoginAttempts) {
        throw new Error('Account temporarily locked. Try again later.');
      }

      // Busca usuário
      const user = await this.userRepository.findByPhone(phone);
      if (!user) {
        await this.incrementLoginAttempts(phone);
        throw new Error('Invalid credentials');
      }

      // Verifica senha
      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        await this.incrementLoginAttempts(phone);
        throw new Error('Invalid credentials');
      }

      // Reseta tentativas de login
      await this.resetLoginAttempts(phone);

      // Se 2FA está habilitado, cria sessão temporária
      if (user.is2FAEnabled) {
        const tempSessionId = await this.createTempSession(user.id);
        const twoFACode = await this.generate2FACode(user.id);
        
        await this.notificationService.sendWhatsAppMessage(user.phone, {
          type: '2fa_code',
          template: 'login_2fa',
          parameters: [twoFACode]
        });

        return { accessToken: '', refreshToken: '', tempSessionId };
      }

      // Atualiza último login
      await this.userRepository.updateLastLogin(user.id, deviceInfo?.ip, deviceInfo);

      // Gera tokens
      const { accessToken, refreshToken } = await this.generateTokens(user);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error in login', { error, phone });
      throw error;
    }
  }

  async verify2FA(tempSessionId: string, code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const userId = await this.validateTempSession(tempSessionId);
      if (!userId) {
        throw new Error('Invalid session');
      }

      const isValid = await this.verify2FACode(userId, code);
      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Limpa sessão temporária
      await this.clearTempSession(tempSessionId);

      // Gera tokens
      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error('Error in 2FA verification', { error, tempSessionId });
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const decoded = verify(refreshToken, this.config.jwtSecret) as { userId: string };
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error('Error refreshing token', { error });
      throw new Error('Invalid refresh token');
    }
  }

  async verifyPhone(userId: string, code: string): Promise<boolean> {
    try {
      const storedCode = await this.redis.get(`verification:${userId}`);
      if (!storedCode || storedCode !== code) {
        return false;
      }

      await this.userRepository.update(userId, {
        isPhoneVerified: true,
        status: UserStatus.ACTIVE
      });

      await this.redis.del(`verification:${userId}`);
      return true;
    } catch (error) {
      this.logger.error('Error verifying phone', { error, userId });
      throw error;
    }
  }

  private async generateVerificationCode(userId: string): Promise<string> {
    const code = randomBytes(3).toString('hex').toUpperCase();
    await this.redis.set(
      `verification:${userId}`,
      code,
      'EX',
      this.config.verificationCodeExpiresIn
    );
    return code;
  }

  private async generate2FACode(userId: string): Promise<string> {
    const code = randomBytes(3).toString('hex').toUpperCase();
    await this.redis.set(
      `2fa:${userId}`,
      code,
      'EX',
      300 // 5 minutos
    );
    return code;
  }

  private async verify2FACode(userId: string, code: string): Promise<boolean> {
    const storedCode = await this.redis.get(`2fa:${userId}`);
    if (!storedCode || storedCode !== code) {
      return false;
    }
    await this.redis.del(`2fa:${userId}`);
    return true;
  }

  private async createTempSession(userId: string): Promise<string> {
    const sessionId = randomBytes(16).toString('hex');
    await this.redis.set(
      `temp_session:${sessionId}`,
      userId,
      'EX',
      300 // 5 minutos
    );
    return sessionId;
  }

  private async validateTempSession(sessionId: string): Promise<string | null> {
    return await this.redis.get(`temp_session:${sessionId}`);
  }

  private async clearTempSession(sessionId: string): Promise<void> {
    await this.redis.del(`temp_session:${sessionId}`);
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = sign(
      { userId: user.id, roles: user.roles },
      this.config.jwtSecret,
      { expiresIn: this.config.jwtExpiresIn }
    );

    const refreshToken = sign(
      { userId: user.id },
      this.config.jwtSecret,
      { expiresIn: this.config.refreshTokenExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  private async getLoginAttempts(phone: string): Promise<number> {
    const attempts = await this.redis.get(`login_attempts:${phone}`);
    return attempts ? parseInt(attempts) : 0;
  }

  private async incrementLoginAttempts(phone: string): Promise<void> {
    await this.redis.incr(`login_attempts:${phone}`);
    await this.redis.expire(
      `login_attempts:${phone}`,
      this.config.lockoutDuration
    );
  }

  private async resetLoginAttempts(phone: string): Promise<void> {
    await this.redis.del(`login_attempts:${phone}`);
  }
}
