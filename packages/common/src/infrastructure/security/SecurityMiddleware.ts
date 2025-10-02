import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../../domain/interfaces/ILogger';
import { AuthService } from './AuthService';
import { KYCLevel } from '../../types';

export class SecurityMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: ILogger
  ) {}

  private getTokenFromHeader(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new Error('Invalid authorization header format');
    }

    return token;
  }

  private getDeviceId(req: Request): string {
    const deviceId = req.headers['x-device-id'];
    if (!deviceId || typeof deviceId !== 'string') {
      throw new Error('Missing or invalid device ID');
    }
    return deviceId;
  }

  private getClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor && typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }
    return req.ip;
  }

  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = this.getTokenFromHeader(req);
      const deviceId = this.getDeviceId(req);
      const ip = this.getClientIp(req);

      const session = await this.authService.validateSession(token, deviceId, ip);
      if (!session) {
        res.status(401).json({ error: 'Invalid session' });
        return;
      }

      req.user = session;
      next();
    } catch (error) {
      this.logger.error('Authentication error', { error });
      res.status(401).json({ error: 'Authentication failed' });
    }
  };

  requireKYCLevel = (requiredLevel: KYCLevel) => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const token = this.getTokenFromHeader(req);
        const deviceId = this.getDeviceId(req);
        const ip = this.getClientIp(req);

        const session = await this.authService.validateSession(token, deviceId, ip);
        if (!session) {
          res.status(401).json({ error: 'Invalid session' });
          return;
        }

        const userKYCLevel = await this.authService.getUserKYCLevel(session.userId);
        if (!this.authService.isKYCLevelSufficient(userKYCLevel, requiredLevel)) {
          res.status(403).json({ error: 'Insufficient KYC level' });
          return;
        }

        req.user = session;
        next();
      } catch (error) {
        this.logger.error('KYC level check error', { error });
        res.status(403).json({ error: 'KYC level check failed' });
      }
    };
  };

  requireWhatsAppOptIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = this.getTokenFromHeader(req);
      const deviceId = this.getDeviceId(req);
      const ip = this.getClientIp(req);

      const session = await this.authService.validateSession(token, deviceId, ip);
      if (!session) {
        res.status(401).json({ error: 'Invalid session' });
        return;
      }

      const hasOptedIn = await this.authService.hasWhatsAppOptIn(session.userId);
      if (!hasOptedIn) {
        res.status(403).json({ error: 'WhatsApp opt-in required' });
        return;
      }

      req.user = session;
      next();
    } catch (error) {
      this.logger.error('WhatsApp opt-in check error', { error });
      res.status(403).json({ error: 'WhatsApp opt-in check failed' });
    }
  };

  requireActiveWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = this.getTokenFromHeader(req);
      const deviceId = this.getDeviceId(req);
      const ip = this.getClientIp(req);

      const session = await this.authService.validateSession(token, deviceId, ip);
      if (!session) {
        res.status(401).json({ error: 'Invalid session' });
        return;
      }

      const hasActiveWallet = await this.authService.hasActiveWallet(session.userId);
      if (!hasActiveWallet) {
        res.status(403).json({ error: 'Active wallet required' });
        return;
      }

      req.user = session;
      next();
    } catch (error) {
      this.logger.error('Active wallet check error', { error });
      res.status(403).json({ error: 'Active wallet check failed' });
    }
  };

  requireTransactionLimit = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = this.getTokenFromHeader(req);
      const deviceId = this.getDeviceId(req);
      const ip = this.getClientIp(req);

      const session = await this.authService.validateSession(token, deviceId, ip);
      if (!session) {
        res.status(401).json({ error: 'Invalid session' });
        return;
      }

      const isWithinLimit = await this.authService.isWithinTransactionLimit(
        session.userId,
        req.body.amount
      );
      if (!isWithinLimit) {
        res.status(403).json({ error: 'Transaction limit exceeded' });
        return;
      }

      req.user = session;
      next();
    } catch (error) {
      this.logger.error('Transaction limit check error', { error });
      res.status(403).json({ error: 'Transaction limit check failed' });
    }
  };

  generateNonce = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const nonce = await this.authService.generateNonce();
      req.nonce = nonce;
      next();
    } catch (error) {
      this.logger.error('Nonce generation error', { error });
      res.status(500).json({ error: 'Failed to generate nonce' });
    }
  };
}