export enum KYCLevel {
  LEVEL_0 = 'LEVEL_0',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
}

export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Network {
  POLYGON = 'POLYGON',
  BSC = 'BSC',
  ETHEREUM = 'ETHEREUM',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  EXCHANGE = 'EXCHANGE',
  BUY = 'BUY',
  SELL = 'SELL',
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum WhatsAppPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum AlertType {
  SUSPICIOUS_TRANSACTION = 'SUSPICIOUS_TRANSACTION',
  LARGE_TRANSACTION = 'LARGE_TRANSACTION',
  UNUSUAL_PATTERN = 'UNUSUAL_PATTERN',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum MessageType {
  TEXT = 'text',
  TEMPLATE = 'template',
  MEDIA = 'media',
  INTERACTIVE = 'interactive'
}

export enum WebhookEventType {
  MESSAGE = 'message',
  STATUS = 'status',
  TEMPLATE = 'template',
  MEDIA = 'media'
}

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push'
}

export enum TemplateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio'
}

export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  NETWORK = 'network'
}
  NETWORK_CONGESTION = 'NETWORK_CONGESTION',
  HIGH_GAS_PRICE = 'HIGH_GAS_PRICE',
  SECURITY_BREACH = 'SECURITY_BREACH',
  GUARDIAN_REQUIRED = 'GUARDIAN_REQUIRED',
  BLACKLISTED_ADDRESS = 'BLACKLISTED_ADDRESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export enum AlertSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}