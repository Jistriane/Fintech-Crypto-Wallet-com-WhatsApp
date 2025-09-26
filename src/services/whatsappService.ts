import axios from 'axios';
import {
  WhatsAppMessage,
  WhatsAppMessageResponse,
  WhatsAppWebhookEvent,
  WhatsAppConfig,
} from '../types/whatsapp';

class WhatsAppService {
  private static instance: WhatsAppService;
  private config: WhatsAppConfig;
  private baseUrl = 'https://graph.facebook.com/v17.0';
  private retryDelay = 1000;
  private maxRetries = 3;

  private constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  public static getInstance(config?: WhatsAppConfig): WhatsAppService {
    if (!WhatsAppService.instance) {
      if (!config) {
        throw new Error('WhatsAppService must be initialized with config');
      }
      WhatsAppService.instance = new WhatsAppService(config);
    }
    return WhatsAppService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  public async sendMessage(
    message: WhatsAppMessage,
    retryCount = 0
  ): Promise<WhatsAppMessageResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          ...message,
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (retryCount < this.maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount))
        );
        return this.sendMessage(message, retryCount + 1);
      }
      throw this.handleError(error);
    }
  }

  public async sendTemplate(
    to: string,
    templateName: string,
    params: Record<string, any>
  ): Promise<WhatsAppMessageResponse> {
    const template = this.config.templates[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const message: WhatsAppMessage = {
      type: 'template',
      to,
      template: {
        name: template.name,
        language: {
          code: template.language,
        },
        components: template.components.map((component) => ({
          type: component.type,
          parameters: component.parameters?.map((param) => {
            const value = params[param.type];
            if (value === undefined) {
              throw new Error(
                `Missing parameter ${param.type} for template ${templateName}`
              );
            }
            return {
              type: param.type,
              ...value,
            };
          }),
        })),
      },
    };

    return this.sendMessage(message);
  }

  public async sendInteractiveMessage(
    to: string,
    header: string,
    body: string,
    buttons: { id: string; title: string }[]
  ): Promise<WhatsAppMessageResponse> {
    const message: WhatsAppMessage = {
      type: 'interactive',
      to,
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: header,
        },
        body: {
          text: body,
        },
        action: {
          buttons: buttons.map((button) => ({
            type: 'reply',
            reply: {
              id: button.id,
              title: button.title,
            },
          })),
        },
      },
    };

    return this.sendMessage(message);
  }

  public async sendListMessage(
    to: string,
    header: string,
    body: string,
    sections: {
      title: string;
      items: { id: string; title: string; description?: string }[];
    }[]
  ): Promise<WhatsAppMessageResponse> {
    const message: WhatsAppMessage = {
      type: 'interactive',
      to,
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: header,
        },
        body: {
          text: body,
        },
        action: {
          sections: sections.map((section) => ({
            title: section.title,
            rows: section.items.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
            })),
          })),
        },
      },
    };

    return this.sendMessage(message);
  }

  public verifyWebhook(token: string): boolean {
    return token === this.config.webhookVerifyToken;
  }

  public handleWebhook(event: WhatsAppWebhookEvent): void {
    // Process messages
    event.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        if (change.value.messages) {
          change.value.messages.forEach((message) => {
            this.processMessage(message);
          });
        }

        if (change.value.statuses) {
          change.value.statuses.forEach((status) => {
            this.processStatus(status);
          });
        }
      });
    });
  }

  private processMessage(message: any): void {
    // Implement message processing logic
    // This should be customized based on your application's needs
    console.log('Processing message:', message);
  }

  private processStatus(status: any): void {
    // Implement status processing logic
    // This should be customized based on your application's needs
    console.log('Processing status:', status);
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.error?.message || 'WhatsApp API error';
      const customError = new Error(message);
      customError.name = error.response.status.toString();
      return customError;
    }
    return new Error('Connection error');
  }
}

export default WhatsAppService;
