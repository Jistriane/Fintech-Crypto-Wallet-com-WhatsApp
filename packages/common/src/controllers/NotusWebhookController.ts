import { Request, Response } from 'express';
import { ILogger } from '../interfaces/ILogger';
import { NotificationService } from '../services/NotificationService';
import { WebhookHandlerService } from '../services/WebhookHandlerService';

export class NotusWebhookController {
  constructor(
    private readonly logger: ILogger,
    private readonly notificationService: NotificationService,
    private readonly webhookHandlerService: WebhookHandlerService
  ) {}

  async handleWebhook(req: Request, res: Response) {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'message':
          await this.handleMessage(data);
          break;
        case 'status':
          await this.handleStatus(data);
          break;
        case 'template':
          await this.handleTemplate(data);
          break;
        case 'media':
          await this.handleMedia(data);
          break;
        default:
          this.logger.warn('Unknown webhook type', { type, data });
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      this.logger.error('Error processing webhook', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async handleMessage(data: any) {
    await this.webhookHandlerService.processMessage(data);
  }

  private async handleStatus(data: any) {
    await this.notificationService.updateMessageStatus(data.messageId, data.status);
  }

  private async handleTemplate(data: any) {
    await this.webhookHandlerService.processTemplate(data);
  }

  private async handleMedia(data: any) {
    await this.webhookHandlerService.processMedia(data);
  }
}