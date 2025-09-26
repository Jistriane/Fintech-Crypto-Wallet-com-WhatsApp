import { create } from 'zustand';
import {
  WhatsAppState,
  WhatsAppMessage,
  WhatsAppConfig,
} from '../types/whatsapp';
import WhatsAppService from '../services/whatsappService';

interface WhatsAppStore extends WhatsAppState {
  initialize: (config: WhatsAppConfig) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: WhatsAppMessage) => Promise<void>;
  sendTemplate: (
    to: string,
    templateName: string,
    params: Record<string, any>
  ) => Promise<void>;
  sendInteractiveMessage: (
    to: string,
    header: string,
    body: string,
    buttons: { id: string; title: string }[]
  ) => Promise<void>;
  sendListMessage: (
    to: string,
    header: string,
    body: string,
    sections: {
      title: string;
      items: { id: string; title: string; description?: string }[];
    }[]
  ) => Promise<void>;
  retryFailedMessages: () => Promise<void>;
  clearError: () => void;
}

export const useWhatsAppStore = create<WhatsAppStore>((set, get) => ({
  isConnected: false,
  lastError: null,
  messageQueue: [],
  retryCount: 0,
  isRetrying: false,
  lastRetryTimestamp: null,

  initialize: (config) => {
    WhatsAppService.getInstance(config);
    set({ isConnected: false, lastError: null });
  },

  connect: async () => {
    try {
      // Implement connection logic if needed
      set({ isConnected: true, lastError: null });
    } catch (error: any) {
      set({
        isConnected: false,
        lastError: error.message || 'Failed to connect',
      });
      throw error;
    }
  },

  disconnect: () => {
    set({ isConnected: false });
  },

  sendMessage: async (message) => {
    const { isConnected, messageQueue } = get();
    if (!isConnected) {
      set({ messageQueue: [...messageQueue, message] });
      return;
    }

    try {
      const whatsapp = WhatsAppService.getInstance();
      await whatsapp.sendMessage(message);
    } catch (error: any) {
      set({
        lastError: error.message || 'Failed to send message',
        messageQueue: [...messageQueue, message],
      });
      throw error;
    }
  },

  sendTemplate: async (to, templateName, params) => {
    try {
      const whatsapp = WhatsAppService.getInstance();
      await whatsapp.sendTemplate(to, templateName, params);
    } catch (error: any) {
      set({
        lastError: error.message || 'Failed to send template',
      });
      throw error;
    }
  },

  sendInteractiveMessage: async (to, header, body, buttons) => {
    try {
      const whatsapp = WhatsAppService.getInstance();
      await whatsapp.sendInteractiveMessage(to, header, body, buttons);
    } catch (error: any) {
      set({
        lastError: error.message || 'Failed to send interactive message',
      });
      throw error;
    }
  },

  sendListMessage: async (to, header, body, sections) => {
    try {
      const whatsapp = WhatsAppService.getInstance();
      await whatsapp.sendListMessage(to, header, body, sections);
    } catch (error: any) {
      set({
        lastError: error.message || 'Failed to send list message',
      });
      throw error;
    }
  },

  retryFailedMessages: async () => {
    const { messageQueue, isRetrying, retryCount } = get();
    if (isRetrying || messageQueue.length === 0) {
      return;
    }

    set({ isRetrying: true });

    try {
      const whatsapp = WhatsAppService.getInstance();
      const failedMessages: WhatsAppMessage[] = [];

      for (const message of messageQueue) {
        try {
          await whatsapp.sendMessage(message);
        } catch (error) {
          failedMessages.push(message);
        }
      }

      set({
        messageQueue: failedMessages,
        retryCount: retryCount + 1,
        isRetrying: false,
        lastRetryTimestamp: Date.now(),
      });
    } catch (error: any) {
      set({
        lastError: error.message || 'Failed to retry messages',
        isRetrying: false,
        lastRetryTimestamp: Date.now(),
      });
      throw error;
    }
  },

  clearError: () => set({ lastError: null }),
}));
