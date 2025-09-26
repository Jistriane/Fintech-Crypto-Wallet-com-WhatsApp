import { NotificationProvider } from '../../domain/services/NotificationService';
import { Notification } from '../../domain/entities/Notification';
import { ILogger } from '@fintech/common';
import axios from 'axios';

interface WhatsAppProviderConfig {
  apiKey: string;
  apiUrl: string;
  webhookUrl: string;
  templates: {
    [key: string]: {
      name: string;
      language: string;
      namespace: string;
    };
  };
}

export class WhatsAppProvider implements NotificationProvider {
  constructor(
    private readonly config: WhatsAppProviderConfig,
    private readonly logger: ILogger
  ) {}

  async send(notification: Notification): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const template = this.config.templates[notification.template];
      if (!template) {
        throw new Error(`Template ${notification.template} not found`);
      }

      const response = await axios.post(
        `${this.config.apiUrl}/messages`,
        {
          recipient_type: 'individual',
          to: notification.userId,
          type: 'template',
          template: {
            namespace: template.namespace,
            name: template.name,
            language: {
              code: template.language
            },
            components: [
              {
                type: 'body',
                parameters: notification.parameters.map(param => ({
                  type: 'text',
                  text: param
                }))
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };
    } catch (error) {
      this.logger.error('Error sending WhatsApp message', {
        error,
        notificationId: notification.id
      });
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async getStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.config.apiUrl}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      const status = response.data.status;
      return {
        status: this.mapStatus(status),
        error: status === 'failed' ? response.data.errors[0]?.message : undefined
      };
    } catch (error) {
      this.logger.error('Error getting WhatsApp message status', {
        error,
        messageId
      });
      return {
        status: 'failed',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  private mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'delivered',
      'failed': 'failed',
      'deleted': 'failed'
    };
    return statusMap[status] || 'unknown';
  }

  async validateTemplate(template: string): Promise<boolean> {
    return !!this.config.templates[template];
  }

  async validatePhoneNumber(phone: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/contacts`,
        {
          blocking: 'wait',
          contacts: [phone],
          force_check: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.contacts[0].status === 'valid';
    } catch (error) {
      this.logger.error('Error validating phone number', { error, phone });
      return false;
    }
  }

  async getTemplates(): Promise<{
    name: string;
    language: string;
    namespace: string;
  }[]> {
    return Object.values(this.config.templates);
  }

  async registerWebhook(): Promise<void> {
    try {
      await axios.post(
        `${this.config.apiUrl}/settings/application`,
        {
          webhooks: {
            url: this.config.webhookUrl,
            events: [
              'message',
              'status'
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      this.logger.error('Error registering webhook', { error });
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      if (payload.type === 'message_status') {
        const messageId = payload.message.id;
        const status = payload.message.status;
        const error = payload.message.errors?.[0]?.message;

        this.logger.info('WhatsApp message status update', {
          messageId,
          status,
          error
        });

        // Evento será processado pelo NotificationService
      }
    } catch (error) {
      this.logger.error('Error handling webhook', { error, payload });
      throw error;
    }
  }
}
