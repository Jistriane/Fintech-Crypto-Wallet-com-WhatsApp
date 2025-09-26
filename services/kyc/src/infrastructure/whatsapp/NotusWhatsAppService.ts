import { WhatsAppSLAMonitor } from '@common/infrastructure/monitoring/WhatsAppSLAMonitor';
import { NotificationEscalator } from '@common/infrastructure/notifications/NotificationEscalator';
import { WhatsAppPriority } from '@common/types';

interface NotusMessage {
  type: 'text' | 'template' | 'image' | 'document';
  content: string | {
    name: string;
    parameters: string[];
  };
  priority: WhatsAppPriority;
}

export class NotusWhatsAppService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.NOTUS_API_KEY!;
    this.baseUrl = process.env.NOTUS_API_URL || 'https://api.notus.com/v1';
  }

  async sendMessage(
    phone: string,
    message: NotusMessage,
    userId: string
  ): Promise<boolean> {
    const notificationId = `${message.type}_${userId}_${Date.now()}`;
    await WhatsAppSLAMonitor.trackNotificationSent(notificationId, message.priority);

    try {
      // TODO: Implementar chamada real à API Notus
      console.log(`[Notus] Enviando mensagem para ${phone}:`, message);

      // Simular envio bem-sucedido
      await this.simulateMessageDelivery(notificationId);

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);

      // Configurar escalonamento
      await NotificationEscalator.handleNotificationTimeout(
        notificationId,
        {
          userId,
          phone,
        },
        message.priority,
        typeof message.content === 'string' 
          ? message.content 
          : `Template: ${message.content.name}`
      );

      return false;
    }
  }

  async sendKYCWelcome(phone: string, userId: string): Promise<boolean> {
    const message: NotusMessage = {
      type: 'template',
      content: {
        name: 'kyc_welcome',
        parameters: []
      },
      priority: 'HIGH'
    };

    return await this.sendMessage(phone, message, userId);
  }

  async requestDocument(
    phone: string,
    userId: string,
    documentType: string
  ): Promise<boolean> {
    const message: NotusMessage = {
      type: 'template',
      content: {
        name: 'kyc_document_request',
        parameters: [documentType]
      },
      priority: 'HIGH'
    };

    return await this.sendMessage(phone, message, userId);
  }

  async notifyDocumentApproved(
    phone: string,
    userId: string,
    documentType: string
  ): Promise<boolean> {
    const message: NotusMessage = {
      type: 'text',
      content: `✅ Seu documento ${documentType} foi aprovado! Prosseguindo com a verificação...`,
      priority: 'HIGH'
    };

    return await this.sendMessage(phone, message, userId);
  }

  async notifyDocumentRejected(
    phone: string,
    userId: string,
    documentType: string,
    reason: string
  ): Promise<boolean> {
    const message: NotusMessage = {
      type: 'text',
      content: `❌ Seu documento ${documentType} foi rejeitado.\nMotivo: ${reason}\nPor favor, envie uma nova foto do documento.`,
      priority: 'HIGH'
    };

    return await this.sendMessage(phone, message, userId);
  }

  async notifyKYCApproved(
    phone: string,
    userId: string,
    level: string
  ): Promise<boolean> {
    const message: NotusMessage = {
      type: 'template',
      content: {
        name: 'kyc_approved',
        parameters: [level]
      },
      priority: 'HIGH'
    };

    return await this.sendMessage(phone, message, userId);
  }

  async notifyKYCRejected(
    phone: string,
    userId: string,
    reason: string
  ): Promise<boolean> {
    const message: NotusMessage = {
      type: 'template',
      content: {
        name: 'kyc_rejected',
        parameters: [reason]
      },
      priority: 'HIGH'
    };

    return await this.sendMessage(phone, message, userId);
  }

  private async simulateMessageDelivery(notificationId: string): Promise<void> {
    // Simular delay de entrega
    await new Promise(resolve => setTimeout(resolve, 500));
    await WhatsAppSLAMonitor.trackNotificationDelivered(notificationId);
  }

  async handleWebhook(payload: any): Promise<void> {
    // TODO: Implementar processamento de webhooks da Notus
    console.log('[Notus] Webhook recebido:', payload);
  }
}
