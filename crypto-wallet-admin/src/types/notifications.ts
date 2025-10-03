export interface NotificationTemplate {
  id: string;
  name: string;
  namespace: string;
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
  components: Array<{
    type: string;
    text?: string;
    parameters?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppContact {
  exists: boolean;
  status: 'active' | 'inactive';
  lastSeen?: string;
}

export interface VerificationResponse {
  success: boolean;
  verificationId?: string;
  expiresAt?: string;
  error?: string;
}

export interface MessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  averageDeliveryTime: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  byTemplate: Array<{
    templateId: string;
    templateName: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
  byHour: Array<{
    hour: number;
    count: number;
  }>;
  byDay: Array<{
    date: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
}

export interface NotificationEvent {
  id: string;
  type: 'message' | 'status' | 'template' | 'media';
  status?: MessageStatus['status'];
  messageId?: string;
  timestamp: number;
  data: any;
}

export type NotificationType = 'TRANSACTION' | 'KYC' | 'SECURITY' | 'MARKETING';

export interface NotificationPreferences {
  transactionAlerts: boolean;
  kycUpdates: boolean;
  securityAlerts: boolean;
  marketingMessages: boolean;
  language: string;
}