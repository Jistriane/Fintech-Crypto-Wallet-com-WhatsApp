import axios from 'axios';
import { ILogger } from '../../domain/interfaces/ILogger';
import { WhatsAppPriority } from '../../types/enums';

export class NotusWhatsAppService {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly logger: ILogger
  ) {}

  async sendMessage(
    phone: string,
    message: string,
    priority: WhatsAppPriority = WhatsAppPriority.MEDIUM
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          phone,
          message,
          priority
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      this.logger.error('Error sending WhatsApp message', error as Error);
      return false;
    }
  }

  async verifyContact(phone: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/contacts/verify`,
        { phone },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

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