import api from './api';
import type { 
  NotificationTemplate, 
  NotificationStats,
  WhatsAppContact,
  MessageStatus,
  VerificationResponse
} from '@/types/notifications';

export interface SendTemplateParams {
  to: string;
  templateId: string;
  language?: string;
  parameters: Array<{
    type: string;
    value: string | number;
  }>;
}

export const notusService = {
  // Templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    const { data } = await api.get('/notifications/templates');
    return data;
  },

  async getTemplate(templateId: string): Promise<NotificationTemplate> {
    const { data } = await api.get(`/notifications/templates/${templateId}`);
    return data;
  },

  async sendTemplate(params: SendTemplateParams): Promise<{ messageId: string }> {
    const { data } = await api.post('/notifications/send-template', params);
    return data;
  },

  // Contatos
  async verifyWhatsAppContact(phone: string): Promise<WhatsAppContact> {
    const { data } = await api.post('/notifications/verify-contact', { phone });
    return data;
  },

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    const { data } = await api.get(`/notifications/messages/${messageId}/status`);
    return data;
  },

  // Estatísticas
  async getNotificationStats(): Promise<NotificationStats> {
    const { data } = await api.get('/notifications/stats');
    return data;
  },

  async getDeliveryStats(days: number = 7): Promise<{
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    dates: string[];
    values: number[];
  }> {
    const { data } = await api.get(`/notifications/stats/delivery?days=${days}`);
    return data;
  },

  // Verificação WhatsApp
  async sendWhatsAppCode(phone: string): Promise<VerificationResponse> {
    const { data } = await api.post('/notifications/send-verification', { phone });
    return data;
  },

  async verifyWhatsAppCode(phone: string, code: string): Promise<boolean> {
    const { data } = await api.post('/notifications/verify-code', { phone, code });
    return data.success;
  },

  // Configurações
  async updateNotificationSettings(settings: {
    enabled: boolean;
    defaultLanguage: string;
    templates: string[];
  }): Promise<void> {
    await api.put('/notifications/settings', settings);
  },

  async getNotificationSettings(): Promise<{
    enabled: boolean;
    defaultLanguage: string;
    templates: string[];
  }> {
    const { data } = await api.get('/notifications/settings');
    return data;
  }
};