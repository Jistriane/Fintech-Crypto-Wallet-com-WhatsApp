import { sign, verify } from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { KYCLevel } from '../../types';
import { RedisCache } from '../cache/RedisCache';
import { NotusWhatsAppService } from '../../../services/kyc/src/infrastructure/whatsapp/NotusWhatsAppService';

interface TokenPayload {
  userId: string;
  kycLevel: KYCLevel;
  phone: string;
  sessionId: string;
}

interface Session {
  userId: string;
  kycLevel: KYCLevel;
  phone: string;
  deviceId: string;
  ip: string;
  createdAt: Date;
  lastActivity: Date;
}

export class AuthService {
  private static readonly SESSION_PREFIX = 'session';
  private static readonly TOKEN_PREFIX = 'token';
  private static readonly SESSION_TTL = 24 * 60 * 60; // 24 horas
  private static readonly MAX_SESSIONS = 3;
  private static readonly RATE_LIMIT_PREFIX = 'auth_rate_limit';
  private static readonly RATE_LIMIT_WINDOW = 15 * 60; // 15 minutos
  private static readonly MAX_FAILED_ATTEMPTS = 5;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly whatsappService: NotusWhatsAppService
  ) {}

  async authenticate(
    phone: string,
    deviceId: string,
    ip: string
  ): Promise<{ token: string; sessionId: string }> {
    // Verificar rate limit
    const isRateLimited = await this.checkRateLimit(phone);
    if (isRateLimited) {
      throw new Error('Too many failed attempts. Try again later.');
    }

    // Buscar usuário
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      await this.incrementFailedAttempts(phone);
      throw new Error('User not found');
    }

    // Gerar código 2FA
    const code = this.generate2FACode();
    
    // Enviar código via WhatsApp
    await this.whatsappService.send2FACode(phone, code);

    // Armazenar código temporariamente
    const codeKey = this.generate2FAKey(phone);
    await RedisCache.set(codeKey, code, 300); // 5 minutos

    // Criar sessão temporária
    const sessionId = await this.createTemporarySession(user.id, deviceId, ip);

    return {
      token: '', // Token será gerado após validação do 2FA
      sessionId
    };
  }

  async verify2FA(
    sessionId: string,
    code: string
  ): Promise<{ token: string }> {
    // Buscar sessão temporária
    const session = await this.getTemporarySession(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }

    // Verificar código
    const codeKey = this.generate2FAKey(session.phone);
    const storedCode = await RedisCache.get<string>(codeKey);

    if (!storedCode || storedCode !== code) {
      await this.incrementFailedAttempts(session.phone);
      throw new Error('Invalid code');
    }

    // Limpar código usado
    await RedisCache.del(codeKey);

    // Buscar usuário
    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Gerenciar sessões ativas
    await this.manageActiveSessions(session);

    // Gerar token
    const token = this.generateToken({
      userId: user.id,
      kycLevel: user.kycLevel,
      phone: user.phone,
      sessionId
    });

    // Armazenar sessão
    await this.storeSession(sessionId, {
      userId: user.id,
      kycLevel: user.kycLevel,
      phone: user.phone,
      deviceId: session.deviceId,
      ip: session.ip,
      createdAt: new Date(),
      lastActivity: new Date()
    });

    return { token };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      // Verificar token
      const payload = verify(
        token,
        process.env.JWT_SECRET!
      ) as TokenPayload;

      // Verificar sessão
      const session = await this.getSession(payload.sessionId);
      if (!session) {
        throw new Error('Invalid session');
      }

      // Atualizar última atividade
      session.lastActivity = new Date();
      await this.storeSession(payload.sessionId, session);

      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    await RedisCache.del(
      RedisCache.generateKey(AuthService.SESSION_PREFIX, sessionId)
    );
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const pattern = RedisCache.generateKey(AuthService.SESSION_PREFIX, '*');
    const keys = await RedisCache.getInstance().keys(pattern);

    for (const key of keys) {
      const session = await RedisCache.get<Session>(key);
      if (session && session.userId === userId) {
        await RedisCache.del(key);
      }
    }
  }

  private generateToken(payload: TokenPayload): string {
    return sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '24h'
    });
  }

  private async createTemporarySession(
    userId: string,
    deviceId: string,
    ip: string
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const key = RedisCache.generateKey(
      AuthService.SESSION_PREFIX,
      'temp',
      sessionId
    );

    await RedisCache.set(key, {
      userId,
      deviceId,
      ip
    }, 300); // 5 minutos

    return sessionId;
  }

  private async getTemporarySession(
    sessionId: string
  ): Promise<{ userId: string; deviceId: string; ip: string } | null> {
    const key = RedisCache.generateKey(
      AuthService.SESSION_PREFIX,
      'temp',
      sessionId
    );

    return await RedisCache.get(key);
  }

  private async storeSession(
    sessionId: string,
    session: Session
  ): Promise<void> {
    const key = RedisCache.generateKey(
      AuthService.SESSION_PREFIX,
      sessionId
    );

    await RedisCache.set(key, session, AuthService.SESSION_TTL);
  }

  private async getSession(sessionId: string): Promise<Session | null> {
    const key = RedisCache.generateKey(
      AuthService.SESSION_PREFIX,
      sessionId
    );

    return await RedisCache.get<Session>(key);
  }

  private async manageActiveSessions(session: Session): Promise<void> {
    const pattern = RedisCache.generateKey(AuthService.SESSION_PREFIX, '*');
    const keys = await RedisCache.getInstance().keys(pattern);

    const userSessions = [];
    for (const key of keys) {
      const existingSession = await RedisCache.get<Session>(key);
      if (existingSession && existingSession.userId === session.userId) {
        userSessions.push({
          key,
          session: existingSession
        });
      }
    }

    // Se exceder o limite, remover sessão mais antiga
    if (userSessions.length >= AuthService.MAX_SESSIONS) {
      userSessions.sort((a, b) => 
        a.session.lastActivity.getTime() - b.session.lastActivity.getTime()
      );

      await RedisCache.del(userSessions[0].key);
    }
  }

  private generate2FACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generate2FAKey(phone: string): string {
    return RedisCache.generateKey(AuthService.TOKEN_PREFIX, '2fa', phone);
  }

  private generateSessionId(): string {
    return Buffer.from(randomBytes(32)).toString('hex');
  }

  private async checkRateLimit(phone: string): Promise<boolean> {
    const key = RedisCache.generateKey(
      AuthService.RATE_LIMIT_PREFIX,
      phone
    );

    const attempts = await RedisCache.getInstance().incr(key);
    if (attempts === 1) {
      await RedisCache.getInstance().expire(
        key,
        AuthService.RATE_LIMIT_WINDOW
      );
    }

    return attempts > AuthService.MAX_FAILED_ATTEMPTS;
  }

  private async incrementFailedAttempts(phone: string): Promise<void> {
    const key = RedisCache.generateKey(
      AuthService.RATE_LIMIT_PREFIX,
      phone
    );

    await RedisCache.getInstance().incr(key);
  }
}
