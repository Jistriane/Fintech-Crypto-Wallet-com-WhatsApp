import { Request, Response, NextFunction } from 'express';
import { AuthService } from './AuthService';
import { RedisCache } from '../cache/RedisCache';
import { RateLimiter } from '../middleware/RateLimiter';
import helmet from 'helmet';
import cors from 'cors';

interface SecurityConfig {
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  csrf: {
    enabled: boolean;
    ignoreMethods: string[];
  };
}

export class SecurityMiddleware {
  private static readonly CSRF_TOKEN_PREFIX = 'csrf';
  private static readonly CSRF_TOKEN_TTL = 3600; // 1 hora
  private static readonly BLOCKED_IPS_PREFIX = 'blocked_ips';
  private static readonly SUSPICIOUS_ACTIVITY_PREFIX = 'suspicious';
  private static readonly MAX_SUSPICIOUS_SCORE = 100;

  constructor(
    private readonly authService: AuthService,
    private readonly config: SecurityConfig
  ) {}

  setupSecurity(app: any): void {
    // Configurações básicas de segurança
    app.use(helmet());
    app.use(this.configureCors());
    app.use(this.validateOrigin.bind(this));
    app.use(this.detectSuspiciousActivity.bind(this));
    app.use(this.validateCSRFToken.bind(this));
    app.use(this.sanitizeInput.bind(this));
    app.use(this.validateContentType.bind(this));
  }

  private configureCors() {
    return cors({
      origin: (origin, callback) => {
        if (!origin || this.config.cors.origin.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: this.config.cors.methods,
      allowedHeaders: this.config.cors.allowedHeaders,
      exposedHeaders: this.config.cors.exposedHeaders,
      credentials: this.config.cors.credentials
    });
  }

  private async validateOrigin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const origin = req.get('origin');
      if (!origin) {
        next();
        return;
      }

      if (!this.config.cors.origin.includes(origin)) {
        await this.incrementSuspiciousScore(req.ip, 'invalid_origin');
        res.status(403).json({ error: 'Invalid origin' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  private async detectSuspiciousActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Verificar IP bloqueado
      const isBlocked = await this.isIPBlocked(req.ip);
      if (isBlocked) {
        res.status(403).json({ error: 'IP blocked' });
        return;
      }

      // Verificar User-Agent
      const userAgent = req.get('user-agent');
      if (!userAgent || this.isSuspiciousUserAgent(userAgent)) {
        await this.incrementSuspiciousScore(req.ip, 'suspicious_user_agent');
      }

      // Verificar headers suspeitos
      if (this.hasSuspiciousHeaders(req.headers)) {
        await this.incrementSuspiciousScore(req.ip, 'suspicious_headers');
      }

      // Verificar parâmetros suspeitos
      if (this.hasSuspiciousParams(req.query)) {
        await this.incrementSuspiciousScore(req.ip, 'suspicious_params');
      }

      // Verificar payload suspeito
      if (this.hasSuspiciousPayload(req.body)) {
        await this.incrementSuspiciousScore(req.ip, 'suspicious_payload');
      }

      // Verificar score total
      const score = await this.getSuspiciousScore(req.ip);
      if (score >= SecurityMiddleware.MAX_SUSPICIOUS_SCORE) {
        await this.blockIP(req.ip);
        res.status(403).json({ error: 'Suspicious activity detected' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  private async validateCSRFToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (
        !this.config.csrf.enabled ||
        this.config.csrf.ignoreMethods.includes(req.method)
      ) {
        next();
        return;
      }

      const token = req.get('X-CSRF-Token');
      if (!token) {
        res.status(403).json({ error: 'CSRF token required' });
        return;
      }

      const isValid = await this.validateToken(token);
      if (!isValid) {
        await this.incrementSuspiciousScore(req.ip, 'invalid_csrf');
        res.status(403).json({ error: 'Invalid CSRF token' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  private sanitizeInput(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Sanitizar query params
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = this.sanitizeString(req.query[key] as string);
      }
    }

    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      this.sanitizeObject(req.body);
    }

    next();
  }

  private validateContentType(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        res.status(415).json({ error: 'Unsupported Media Type' });
        return;
      }
    }

    next();
  }

  private async isIPBlocked(ip: string): Promise<boolean> {
    const key = RedisCache.generateKey(
      SecurityMiddleware.BLOCKED_IPS_PREFIX,
      ip
    );
    return await RedisCache.get(key) !== null;
  }

  private async blockIP(ip: string): Promise<void> {
    const key = RedisCache.generateKey(
      SecurityMiddleware.BLOCKED_IPS_PREFIX,
      ip
    );
    await RedisCache.set(key, true, 24 * 3600); // 24 horas
  }

  private async incrementSuspiciousScore(
    ip: string,
    reason: string
  ): Promise<void> {
    const key = RedisCache.generateKey(
      SecurityMiddleware.SUSPICIOUS_ACTIVITY_PREFIX,
      ip
    );
    
    const score = await RedisCache.getInstance().hincrby(key, reason, 10);
    await RedisCache.getInstance().expire(key, 3600); // 1 hora
  }

  private async getSuspiciousScore(ip: string): Promise<number> {
    const key = RedisCache.generateKey(
      SecurityMiddleware.SUSPICIOUS_ACTIVITY_PREFIX,
      ip
    );
    
    const scores = await RedisCache.getInstance().hgetall(key);
    return Object.values(scores)
      .reduce((total, score) => total + parseInt(score), 0);
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspicious = [
      'curl',
      'python',
      'wget',
      'bot',
      'crawler',
      'spider'
    ];

    return suspicious.some(s => userAgent.toLowerCase().includes(s));
  }

  private hasSuspiciousHeaders(headers: any): boolean {
    const suspicious = [
      'x-forwarded-for',
      'x-real-ip',
      'proxy-client-ip'
    ];

    return suspicious.some(h => headers[h]);
  }

  private hasSuspiciousParams(params: any): boolean {
    const suspicious = [
      'eval',
      'exec',
      'script',
      'alert',
      'document',
      'window',
      'cookie'
    ];

    return Object.values(params).some(v =>
      typeof v === 'string' && suspicious.some(s => v.includes(s))
    );
  }

  private hasSuspiciousPayload(body: any): boolean {
    if (!body) return false;

    const suspicious = [
      '<script',
      'javascript:',
      'onerror=',
      'onload=',
      'eval(',
      'document.',
      'window.'
    ];

    const json = JSON.stringify(body).toLowerCase();
    return suspicious.some(s => json.includes(s));
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove tags
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/eval\(/gi, '') // Remove eval()
      .trim();
  }

  private sanitizeObject(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = this.sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        this.sanitizeObject(obj[key]);
      }
    }
  }

  private async validateToken(token: string): Promise<boolean> {
    const key = RedisCache.generateKey(
      SecurityMiddleware.CSRF_TOKEN_PREFIX,
      token
    );
    return await RedisCache.get(key) !== null;
  }

  async generateCSRFToken(): Promise<string> {
    const token = Buffer.from(randomBytes(32)).toString('hex');
    const key = RedisCache.generateKey(
      SecurityMiddleware.CSRF_TOKEN_PREFIX,
      token
    );
    
    await RedisCache.set(
      key,
      true,
      SecurityMiddleware.CSRF_TOKEN_TTL
    );

    return token;
  }
}
