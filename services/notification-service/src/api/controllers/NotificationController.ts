import { Request, Response } from 'express';
import { NotificationService } from '../../domain/services/NotificationService';
import { WhatsAppProvider } from '../../infrastructure/providers/WhatsAppProvider';
import { ILogger } from '@fintech/common';

export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly whatsAppProvider: WhatsAppProvider,
    private readonly logger: ILogger
  ) {}

  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const notification = await this.notificationService.createNotification(req.body);

      res.status(201).json({
        message: 'Notification created successfully',
        notification: {
          id: notification.id,
          type: notification.type,
          status: notification.status
        }
      });

      this.logger.info('Notification created', {
        notificationId: notification.id,
        type: notification.type
      });
    } catch (error) {
      this.logger.error('Error creating notification', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotificationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const notification = await this.notificationService.getNotificationStatus(id);

      res.json({
        id: notification.id,
        status: notification.status,
        delivery: notification.delivery,
        metrics: notification.metrics,
        attempts: notification.attempts
      });
    } catch (error) {
      this.logger.error('Error getting notification status', {
        error,
        notificationId: req.params.id
      });

      if (error.message === 'Notification not found') {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { channel, deviceInfo } = req.body;

      await this.notificationService.markAsRead(id, channel, deviceInfo);

      res.json({
        message: 'Notification marked as read'
      });
    } catch (error) {
      this.logger.error('Error marking notification as read', {
        error,
        notificationId: req.params.id
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cancelNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      await this.notificationService.cancelNotification(id, reason);

      res.json({
        message: 'Notification cancelled successfully'
      });
    } catch (error) {
      this.logger.error('Error cancelling notification', {
        error,
        notificationId: req.params.id
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const stats = await this.notificationService.getNotificationStats(userId);

      res.json(stats);
    } catch (error) {
      this.logger.error('Error getting notification stats', {
        error,
        userId: req.params.userId
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDeliveryRate(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;

      const rate = await this.notificationService.getDeliveryRate(type);

      res.json(rate);
    } catch (error) {
      this.logger.error('Error getting delivery rate', {
        error,
        type: req.params.type
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFailureRate(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;

      const rate = await this.notificationService.getFailureRate(type);

      res.json(rate);
    } catch (error) {
      this.logger.error('Error getting failure rate', {
        error,
        type: req.params.type
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAverageDeliveryTime(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;

      const time = await this.notificationService.getAverageDeliveryTime(type);

      res.json({ averageDeliveryTime: time });
    } catch (error) {
      this.logger.error('Error getting average delivery time', {
        error,
        type: req.params.type
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotificationVolume(req: Request, res: Response): Promise<void> {
    try {
      const { days } = req.query;

      const volume = await this.notificationService.getNotificationVolume(Number(days));

      res.json({ volume });
    } catch (error) {
      this.logger.error('Error getting notification volume', {
        error,
        days: req.query.days
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTopFailureReasons(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;

      const reasons = await this.notificationService.getTopFailureReasons(Number(limit));

      res.json({ reasons });
    } catch (error) {
      this.logger.error('Error getting top failure reasons', {
        error,
        limit: req.query.limit
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async validateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { template } = req.body;

      const isValid = await this.whatsAppProvider.validateTemplate(template);

      res.json({ isValid });
    } catch (error) {
      this.logger.error('Error validating template', {
        error,
        template: req.body.template
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async validatePhoneNumber(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body;

      const isValid = await this.whatsAppProvider.validatePhoneNumber(phone);

      res.json({ isValid });
    } catch (error) {
      this.logger.error('Error validating phone number', {
        error,
        phone: req.body.phone
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await this.whatsAppProvider.getTemplates();

      res.json({ templates });
    } catch (error) {
      this.logger.error('Error getting templates', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      await this.whatsAppProvider.handleWebhook(req.body);

      res.status(200).send();
    } catch (error) {
      this.logger.error('Error handling webhook', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
