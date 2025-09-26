import { Request, Response } from 'express';
import { AuthService } from '../../domain/services/AuthService';
import { ILogger } from '@fintech/common';
import { validate } from 'class-validator';
import { User } from '../../domain/entities/User';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: ILogger
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { phone, email, password } = req.body;

      // Validação
      const user = new User();
      user.phone = phone;
      user.email = email;
      user.password = password;

      const errors = await validate(user);
      if (errors.length > 0) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      // Registro
      const { user: newUser, verificationCode } = await this.authService.register({
        phone,
        email,
        password
      });

      res.status(201).json({
        message: 'User registered successfully. Verification code sent via WhatsApp.',
        userId: newUser.id
      });

      this.logger.info('User registered successfully', {
        userId: newUser.id,
        phone: newUser.phone
      });
    } catch (error) {
      this.logger.error('Error in registration', { error });
      
      if (error.message.includes('already registered')) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { phone, password } = req.body;
      const deviceInfo = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        ...req.body.deviceInfo
      };

      const result = await this.authService.login(phone, password, deviceInfo);

      if (result.tempSessionId) {
        res.json({
          message: '2FA code sent via WhatsApp',
          tempSessionId: result.tempSessionId
        });
        return;
      }

      res.json({
        message: 'Login successful',
        ...result
      });

      this.logger.info('User logged in successfully', { phone });
    } catch (error) {
      this.logger.error('Error in login', { error, phone });

      if (error.message === 'Account temporarily locked. Try again later.') {
        res.status(429).json({ error: error.message });
        return;
      }

      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const { tempSessionId, code } = req.body;

      const result = await this.authService.verify2FA(tempSessionId, code);

      res.json({
        message: '2FA verification successful',
        ...result
      });

      this.logger.info('2FA verification successful', { tempSessionId });
    } catch (error) {
      this.logger.error('Error in 2FA verification', { error, tempSessionId: req.body.tempSessionId });

      if (error.message === 'Invalid session' || error.message === 'Invalid 2FA code') {
        res.status(401).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await this.authService.refreshToken(refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        ...result
      });

      this.logger.info('Token refreshed successfully');
    } catch (error) {
      this.logger.error('Error refreshing token', { error });
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  async verifyPhone(req: Request, res: Response): Promise<void> {
    try {
      const { userId, code } = req.body;

      const isValid = await this.authService.verifyPhone(userId, code);

      if (!isValid) {
        res.status(400).json({ error: 'Invalid verification code' });
        return;
      }

      res.json({
        message: 'Phone verified successfully'
      });

      this.logger.info('Phone verified successfully', { userId });
    } catch (error) {
      this.logger.error('Error in phone verification', { error, userId: req.body.userId });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
