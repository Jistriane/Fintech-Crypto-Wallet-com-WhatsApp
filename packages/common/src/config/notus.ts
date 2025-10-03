import { WhatsAppPriority } from '../types/enums';

export const NOTUS_CONFIG = {
  API_URL: process.env.NOTUS_API_URL || 'https://api.notus.com/v1',
  API_KEY: process.env.NOTUS_API_KEY,
  WEBHOOK_URL: process.env.NOTUS_WEBHOOK_URL,
  WEBHOOK_SECRET: process.env.NOTUS_WEBHOOK_SECRET,
  TEMPLATES: {
    TRANSACTION: {
      name: 'transaction_confirmation',
      namespace: 'fintech_wallet',
      language: 'pt_BR'
    },
    KYC: {
      name: 'kyc_status',
      namespace: 'fintech_wallet',
      language: 'pt_BR'
    },
    SECURITY: {
      name: 'security_alert',
      namespace: 'fintech_wallet',
      language: 'pt_BR'
    },
    BALANCE: {
      name: 'balance_update',
      namespace: 'fintech_wallet',
      language: 'pt_BR'
    }
  },
  PRIORITIES: {
    SECURITY: WhatsAppPriority.CRITICAL,
    TRANSACTION: WhatsAppPriority.HIGH,
    KYC: WhatsAppPriority.HIGH,
    NOTIFICATION: WhatsAppPriority.MEDIUM,
    MARKETING: WhatsAppPriority.LOW
  },
  RATE_LIMITS: {
    MESSAGES: {
      windowMs: 60000, // 1 minuto
      max: 60 // 60 mensagens por minuto
    },
    WEBHOOKS: {
      windowMs: 1000, // 1 segundo
      max: 100 // 100 webhooks por segundo
    }
  }
};