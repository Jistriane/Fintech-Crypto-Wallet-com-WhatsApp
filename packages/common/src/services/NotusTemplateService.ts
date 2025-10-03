import { ILogger } from '../interfaces/ILogger';
import { NotusMonitoringService } from '../monitoring/NotusMonitoringService';
import { NOTUS_CONFIG } from '../config/notus';
import { NotificationStatus, TemplateStatus } from '../types/enums';
import axios from 'axios';

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
  currency?: {
    amount: number;
    code: string;
  };
  dateTime?: {
    timestamp: number;
    format?: string;
  };
}

export interface TemplateMessage {
  templateId: string;
  to: string;
  language: string;
  parameters: TemplateParameter[];
}

export interface Template {
  id: string;
  name: string;
  namespace: string;
  language: string;
  status: TemplateStatus;
  category: string;
  components: {
    type: string;
    text?: string;
    parameters?: number;
  }[];
}

export class NotusTemplateService {
  constructor(
    private readonly logger: ILogger,
    private readonly monitoring: NotusMonitoringService
  ) {}

  async createTemplate(template: Partial<Template>): Promise<Template> {
    try {
      const response = await axios.post(
        `${NOTUS_CONFIG.API_URL}/templates`,
        template,
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.info('Template created successfully', {
        templateId: response.data.id,
        name: template.name
      });

      return response.data;
    } catch (error) {
      this.monitoring.trackError('create_template', error as Error, {
        template: template.name
      });
      throw error;
    }
  }

  async getTemplate(templateId: string): Promise<Template> {
    try {
      const response = await axios.get(
        `${NOTUS_CONFIG.API_URL}/templates/${templateId}`,
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      this.monitoring.trackError('get_template', error as Error, {
        templateId
      });
      throw error;
    }
  }

  async listTemplates(): Promise<Template[]> {
    try {
      const response = await axios.get(
        `${NOTUS_CONFIG.API_URL}/templates`,
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      this.monitoring.trackError('list_templates', error as Error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await axios.delete(
        `${NOTUS_CONFIG.API_URL}/templates/${templateId}`,
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`
          }
        }
      );

      this.logger.info('Template deleted successfully', { templateId });
    } catch (error) {
      this.monitoring.trackError('delete_template', error as Error, {
        templateId
      });
      throw error;
    }
  }

  async sendTemplateMessage(message: TemplateMessage): Promise<{
    messageId: string;
    status: NotificationStatus;
  }> {
    try {
      const template = await this.getTemplate(message.templateId);
      
      if (template.status !== TemplateStatus.APPROVED) {
        throw new Error(`Template ${message.templateId} is not approved`);
      }

      const response = await axios.post(
        `${NOTUS_CONFIG.API_URL}/messages`,
        {
          to: message.to,
          type: 'template',
          template: {
            name: template.name,
            namespace: template.namespace,
            language: {
              code: message.language || template.language
            },
            components: this.formatTemplateComponents(message.parameters)
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${NOTUS_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.monitoring.trackMessageSent(
        template.name,
        this.getPriorityForTemplate(template.name),
        'template'
      );

      return {
        messageId: response.data.messageId,
        status: NotificationStatus.SENT
      };
    } catch (error) {
      this.monitoring.trackError('send_template', error as Error, {
        templateId: message.templateId,
        to: message.to
      });
      throw error;
    }
  }

  private formatTemplateComponents(parameters: TemplateParameter[]): any[] {
    return parameters.map(param => {
      const component: any = { type: 'body', parameters: [] };

      switch (param.type) {
        case 'text':
          component.parameters.push({
            type: 'text',
            text: param.text
          });
          break;

        case 'currency':
          if (param.currency) {
            component.parameters.push({
              type: 'currency',
              currency: {
                fallback_value: `${param.currency.amount} ${param.currency.code}`,
                code: param.currency.code,
                amount_1000: param.currency.amount * 1000
              }
            });
          }
          break;

        case 'date_time':
          if (param.dateTime) {
            component.parameters.push({
              type: 'date_time',
              timestamp: param.dateTime.timestamp,
              format: param.dateTime.format || 'dd/MM/yyyy HH:mm'
            });
          }
          break;
      }

      return component;
    });
  }

  private getPriorityForTemplate(templateName: string): string {
    const template = Object.entries(NOTUS_CONFIG.TEMPLATES)
      .find(([_, template]) => template.name === templateName);
    
    if (!template) return 'MEDIUM';
    
    return NOTUS_CONFIG.PRIORITIES[template[0]] || 'MEDIUM';
  }
}