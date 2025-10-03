import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../interfaces/ILogger';
import { NotusMonitoringService } from '../monitoring/NotusMonitoringService';
import { WebhookEventType, NotificationStatus, MessageType } from '../types/enums';
import { NOTUS_CONFIG } from '../config/notus';
import crypto from 'crypto';

export interface WebhookPayload {
  type: WebhookEventType;
  messageId?: string;
  status?: NotificationStatus;
  from?: string;
  timestamp: number;
  data: any;
}

export class NotusWebhookService {
  constructor(
    private readonly logger: ILogger,
    private readonly monitoring: NotusMonitoringService
  ) {}

  // Middleware para validação de assinatura
  validateWebhook(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['x-notus-signature'];
    const payload = JSON.stringify(req.body);

    if (!signature) {
      this.logger.warn('Missing webhook signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    const expectedSignature = this.generateSignature(payload);
    if (signature !== expectedSignature) {
      this.logger.warn('Invalid webhook signature', { 
        received: signature,
        expected: expectedSignature 
      });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  }

  // Processa eventos de webhook
  async processWebhook(payload: WebhookPayload): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.info('Processing webhook', { type: payload.type });

      switch (payload.type) {
        case WebhookEventType.MESSAGE:
          await this.handleMessageEvent(payload);
          break;
        case WebhookEventType.STATUS:
          await this.handleStatusEvent(payload);
          break;
        case WebhookEventType.TEMPLATE:
          await this.handleTemplateEvent(payload);
          break;
        case WebhookEventType.MEDIA:
          await this.handleMediaEvent(payload);
          break;
        default:
          this.logger.warn('Unknown webhook event type', { type: payload.type });
      }

      const processingTime = Date.now() - startTime;
      this.monitoring.trackWebhookReceived(
        payload.type,
        'success',
        processingTime
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.monitoring.trackWebhookReceived(
        payload.type,
        'error',
        processingTime
      );
      this.monitoring.trackError('webhook_processing', error as Error, {
        type: payload.type,
        payload
      });
      throw error;
    }
  }

  // Manipuladores específicos de eventos
  private async handleMessageEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info('Handling message event', {
      from: payload.from,
      messageId: payload.messageId
    });

    if (payload.data.type === MessageType.TEXT) {
      // Processar mensagem de texto
      await this.processTextMessage(payload);
    } else if (payload.data.type === MessageType.INTERACTIVE) {
      // Processar mensagem interativa
      await this.processInteractiveMessage(payload);
    }
  }

  private async handleStatusEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info('Handling status event', {
      messageId: payload.messageId,
      status: payload.status
    });

    if (payload.messageId && payload.status) {
      this.monitoring.trackMessageStatus(
        payload.messageId,
        payload.status
      );

      if (payload.status === NotificationStatus.DELIVERED) {
        const deliveryTime = Date.now() - payload.timestamp;
        this.monitoring.trackDeliveryTime(payload.messageId, deliveryTime);
      }
    }
  }

  private async handleTemplateEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info('Handling template event', {
      template: payload.data.template
    });
    // Implementar lógica específica para eventos de template
  }

  private async handleMediaEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info('Handling media event', {
      mediaType: payload.data.mediaType
    });
    // Implementar lógica específica para eventos de mídia
  }

  // Processadores específicos de mensagens
  private async processTextMessage(payload: WebhookPayload): Promise<void> {
    // Implementar processamento de mensagens de texto
    this.logger.info('Processing text message', {
      from: payload.from,
      text: payload.data.text
    });
  }

  private async processInteractiveMessage(payload: WebhookPayload): Promise<void> {
    // Implementar processamento de mensagens interativas
    this.logger.info('Processing interactive message', {
      from: payload.from,
      interaction: payload.data.interactive
    });
  }

  // Utilitários
  private generateSignature(payload: string): string {
    return crypto
      .createHmac('sha256', NOTUS_CONFIG.WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
  }
}