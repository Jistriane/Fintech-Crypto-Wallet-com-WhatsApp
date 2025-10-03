import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { NOTUS_CONFIG } from '../config/notus';

export const validateNotusWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['x-notus-signature'];
  if (!signature) {
    return res.status(401).json({ error: 'No signature provided' });
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', NOTUS_CONFIG.API_KEY)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};