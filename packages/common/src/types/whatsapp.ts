export enum WhatsAppPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum WhatsAppMessageType {
  TEXT = 'text',
  TEMPLATE = 'template',
  MEDIA = 'media',
  LOCATION = 'location',
  INTERACTIVE = 'interactive',
}

export enum WhatsAppTemplateLanguage {
  PT_BR = 'pt_BR',
  EN = 'en',
  ES = 'es',
}

export interface WhatsAppTemplateComponent {
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
}

export interface WhatsAppTemplate {
  name: string;
  language: {
    code: WhatsAppTemplateLanguage;
  };
  components?: WhatsAppTemplateComponent[];
}

export interface WhatsAppMessage {
  to: string;
  type: WhatsAppMessageType;
  text?: string;
  template?: WhatsAppTemplate;
}

export interface WhatsAppMessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  error?: string;
}

export interface WhatsAppContact {
  phone: string;
  name?: string;
  exists: boolean;
  lastSeen?: Date;
  optIn: boolean;
}

export interface WhatsAppSLAConfig {
  readonly CRITICAL: {
    readonly types: readonly ['SECURITY_ALERT', 'LARGE_TRANSACTION', 'KYC_REJECTION'];
    readonly targetDelivery: number;
    readonly maxRetries: number;
    readonly escalation: 'SMS';
  };
  readonly HIGH: {
    readonly types: readonly ['TRANSACTION_CONFIRMATION', 'KYC_APPROVAL'];
    readonly targetDelivery: number;
    readonly maxRetries: number;
    readonly escalation: 'EMAIL';
  };
  readonly MEDIUM: {
    readonly types: readonly ['BALANCE_UPDATE', 'PRICE_ALERT'];
    readonly targetDelivery: number;
    readonly maxRetries: number;
    readonly escalation: 'NOTIFICATION';
  };
  readonly LOW: {
    readonly types: readonly ['MARKETING', 'NEWS'];
    readonly targetDelivery: number;
    readonly maxRetries: number;
    readonly escalation: 'NONE';
  };
}
