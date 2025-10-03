import axios from 'axios';
import { ILogger } from '../../domain/interfaces/ILogger';
import { WhatsAppPriority } from '../../types/enums';
import { NOTUS_CONFIG } from '../../config/notus';
import { NotusMonitoringService } from '../../monitoring/NotusMonitoringService';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'media';
  text?: string;
  template?: {
    name: string;
    namespace: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text?: string;
        currency?: {
          fallback_value: string;
          code: string;
          amount_1000: number;
        };
      }>;
    }>;
  };
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    filename?: string;
  };
}

export class NotusWhatsAppService {
  constructor(
    private readonly logger: ILogger,
    private readonly monitoring: NotusMonitoringService
  ) {}

  async sendMessage(message: WhatsAppMessage): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const response = await axios.post(
        `${NOTUS_CONFIG.API_URL}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.monitoring.trackApiLatency('sendMessage', Date.now() - startTime);
      
      if (message.template) {
        this.monitoring.trackMessageSent(
          message.template.name,
          this.getPriorityForTemplate(message.template.name)
        );
      }

      return {
        success: true,
        messageId: response.data.messageId
      };
    } catch (error: any) {
      this.monitoring.trackError('sendMessage', error);
      this.logger.error('Error sending WhatsApp message', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendTextMessage(
    to: string,
    text: string,
    priority: WhatsAppPriority = WhatsAppPriority.MEDIUM
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    return this.sendMessage({
      to,
      type: 'text',
      text
    });
  }

  async verifyContact(phone: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${NOTUS_CONFIG.API_URL}/contacts/verify`,
        { phone },
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.exists === true;
    } catch (error: any) {
      this.monitoring.trackError('verifyContact', error);
      this.logger.error('Error verifying WhatsApp contact', error);
      return false;
    }
  }

  async getMessageStatus(messageId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${NOTUS_CONFIG.API_URL}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`
          }
        }
      );

      return response.data.status;
    } catch (error: any) {
      this.monitoring.trackError('getMessageStatus', error);
      this.logger.error('Error getting message status', error);
      return 'error';
    }
  }

  async registerWebhook(): Promise<boolean> {
    try {
      await axios.post(
        `${NOTUS_CONFIG.API_URL}/settings/application`,
        {
          webhooks: {
            url: NOTUS_CONFIG.WEBHOOK_URL,
            events: [
              'message',
              'status',
              'template',
              'media'
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error: any) {
      this.monitoring.trackError('registerWebhook', error);
      this.logger.error('Error registering webhook', error);
      return false;
    }
  }

  private getPriorityForTemplate(templateName: string): string {
    const template = Object.entries(NOTUS_CONFIG.TEMPLATES)
      .find(([_, template]) => template.name === templateName);
    
    if (!template) return 'MEDIUM';
    
    return NOTUS_CONFIG.PRIORITIES[template[0]] || 'MEDIUM';
  }
}

      return response.data.exists === true;
    } catch (error) {
      this.logger.error('Error verifying WhatsApp contact', error as Error);
      return false;
    }
  }

  async getMessageStatus(messageId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.status;
    } catch (error) {
      this.logger.error('Error getting message status', error as Error);
      return 'error';
    }
  }

  async ping(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/health`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      this.logger.error('Error pinging WhatsApp service', error as Error);
      return false;
    }
  }

  getMessagePriority(type: string): WhatsAppPriority {
    switch (type.toUpperCase()) {
      case 'SECURITY':
      case 'EMERGENCY':
        return WhatsAppPriority.CRITICAL;
      case 'TRANSACTION':
      case 'ALERT':
        return WhatsAppPriority.HIGH;
      case 'NOTIFICATION':
        return WhatsAppPriority.MEDIUM;
      default:
        return WhatsAppPriority.LOW;
    }
  }
}