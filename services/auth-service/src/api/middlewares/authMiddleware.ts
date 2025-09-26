import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { ILogger } from '@fintech/common';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        roles: string[];
      };
    }
  }
}

export const createAuthMiddleware = (jwtSecret: string, logger: ILogger) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const [type, token] = authHeader.split(' ');

      if (type !== 'Bearer' || !token) {
        res.status(401).json({ error: 'Invalid token format' });
        return;
      }

      try {
        const decoded = verify(token, jwtSecret) as {
          userId: string;
          roles: string[];
        };

        req.user = decoded;
        next();
      } catch (error) {
        logger.error('Token verification failed', { error });
        res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      logger.error('Auth middleware error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRequiredRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
