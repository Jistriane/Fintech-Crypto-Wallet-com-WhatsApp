import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from './RateLimiter';
import { KYCLevel } from '../../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    kycLevel: KYCLevel;
  };
}

export const rateLimitMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verificar limite por endpoint
    const endpointAllowed = await RateLimiter.checkEndpointRateLimit(
      req.path,
      req.ip
    );

    if (!endpointAllowed) {
      res.status(429).json({
        error: 'Too many requests for this endpoint',
        retryAfter: 60 // Sugerir espera de 1 minuto
      });
      return;
    }

    // Se o usuário estiver autenticado, verificar limite por usuário
    if (req.user) {
      const userAllowed = await RateLimiter.checkUserRateLimit(
        req.user.id,
        req.user.kycLevel
      );

      if (!userAllowed) {
        res.status(429).json({
          error: 'Rate limit exceeded for your KYC level',
          retryAfter: 3600 // Sugerir espera de 1 hora
        });
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const whatsappRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verificar limite global do WhatsApp
    const globalAllowed = await RateLimiter.checkWhatsAppGlobalRateLimit();
    if (!globalAllowed) {
      res.status(429).json({
        error: 'Global WhatsApp rate limit exceeded',
        retryAfter: 3600
      });
      return;
    }

    // Verificar limite por usuário do WhatsApp
    const phone = req.body.phone || req.query.phone;
    if (phone) {
      const userAllowed = await RateLimiter.checkWhatsAppUserRateLimit(phone);
      if (!userAllowed) {
        res.status(429).json({
          error: 'WhatsApp rate limit exceeded for this phone number',
          retryAfter: 3600
        });
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
