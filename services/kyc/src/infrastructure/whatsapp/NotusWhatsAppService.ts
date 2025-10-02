import axios from 'axios';
import { ILogger } from '@fintech-crypto/common';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: string;
  template?: {
    name: string;
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
}

export class NotusWhatsAppService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    apiKey: string,
    baseUrl: string = 'https://api.notus.com/v1',
    private readonly logger: ILogger
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      this.logger.error('Error sending WhatsApp message', { error, message });
      return false;
    }
  }

  async verifyNumber(phone: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/contacts/verify`,
        { phone },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.exists === true;
    } catch (error) {
      this.logger.error('Error verifying WhatsApp number', { error, phone });
      return false;
    }
  }

  async getMessageStatus(messageId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.status;
    } catch (error) {
      this.logger.error('Error getting message status', { error, messageId });
      return 'error';
    }
  }
}