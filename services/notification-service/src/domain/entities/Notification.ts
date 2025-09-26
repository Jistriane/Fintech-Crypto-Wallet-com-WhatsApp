import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NotificationType {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum NotificationCategory {
  SECURITY = 'SECURITY',
  TRANSACTION = 'TRANSACTION',
  KYC = 'KYC',
  PRICE_ALERT = 'PRICE_ALERT',
  SYSTEM = 'SYSTEM',
  MARKETING = 'MARKETING'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationPriority })
  priority: NotificationPriority;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ type: 'enum', enum: NotificationCategory })
  category: NotificationCategory;

  @Column()
  template: string;

  @Column('text', { array: true })
  parameters: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    transactionId?: string;
    walletId?: string;
    tokenId?: string;
    alertId?: string;
    deviceId?: string;
    ip?: string;
    userAgent?: string;
  };

  @Column({ type: 'jsonb', default: [] })
  attempts: {
    timestamp: Date;
    status: NotificationStatus;
    error?: string;
    provider?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  delivery: {
    timestamp: Date;
    channel: string;
    messageId: string;
    status: string;
    error?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  read: {
    timestamp: Date;
    channel: string;
    deviceInfo?: any;
  };

  @Column({ type: 'jsonb', default: {} })
  preferences: {
    retryCount: number;
    maxRetries: number;
    retryDelay: number;
    expiresAt?: Date;
    fallbackChannels: NotificationType[];
  };

  @Column({ type: 'jsonb', default: {} })
  metrics: {
    deliveryTime?: number;
    readTime?: number;
    retryCount: number;
    failureCount: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  // Métodos de domínio
  addAttempt(status: NotificationStatus, error?: string, provider?: string): void {
    if (!this.attempts) {
      this.attempts = [];
    }

    this.attempts.push({
      timestamp: new Date(),
      status,
      error,
      provider
    });

    this.metrics.retryCount = this.attempts.length;
    if (status === NotificationStatus.FAILED) {
      this.metrics.failureCount++;
    }
  }

  markAsSent(messageId: string, channel: string): void {
    this.status = NotificationStatus.SENT;
    this.sentAt = new Date();
    this.delivery = {
      timestamp: new Date(),
      channel,
      messageId,
      status: 'sent'
    };
  }

  markAsDelivered(channel: string): void {
    this.status = NotificationStatus.DELIVERED;
    this.deliveredAt = new Date();
    if (this.delivery) {
      this.delivery.status = 'delivered';
      this.delivery.timestamp = new Date();
    }

    // Calcula tempo de entrega
    if (this.sentAt) {
      this.metrics.deliveryTime = this.deliveredAt.getTime() - this.sentAt.getTime();
    }
  }

  markAsRead(channel: string, deviceInfo?: any): void {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
    this.read = {
      timestamp: new Date(),
      channel,
      deviceInfo
    };

    // Calcula tempo de leitura
    if (this.deliveredAt) {
      this.metrics.readTime = this.readAt.getTime() - this.deliveredAt.getTime();
    }
  }

  markAsFailed(error: string): void {
    this.status = NotificationStatus.FAILED;
    if (this.delivery) {
      this.delivery.status = 'failed';
      this.delivery.error = error;
      this.delivery.timestamp = new Date();
    }
  }

  cancel(reason: string): void {
    this.status = NotificationStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (this.delivery) {
      this.delivery.status = 'cancelled';
      this.delivery.error = reason;
      this.delivery.timestamp = new Date();
    }
  }

  shouldRetry(): boolean {
    return (
      this.status === NotificationStatus.FAILED &&
      this.metrics.retryCount < this.preferences.maxRetries
    );
  }

  getNextRetryDelay(): number {
    // Exponential backoff
    return this.preferences.retryDelay * Math.pow(2, this.metrics.retryCount);
  }

  isExpired(): boolean {
    if (!this.preferences.expiresAt) {
      return false;
    }
    return new Date() > new Date(this.preferences.expiresAt);
  }

  shouldEscalate(): boolean {
    return (
      this.status === NotificationStatus.FAILED &&
      this.metrics.retryCount >= this.preferences.maxRetries &&
      this.preferences.fallbackChannels.length > 0
    );
  }

  getNextFallbackChannel(): NotificationType | null {
    if (!this.shouldEscalate()) {
      return null;
    }

    const currentIndex = this.preferences.fallbackChannels.indexOf(this.type);
    if (currentIndex === -1 || currentIndex === this.preferences.fallbackChannels.length - 1) {
      return null;
    }

    return this.preferences.fallbackChannels[currentIndex + 1];
  }

  get deliveryStatus(): string {
    return this.delivery?.status || 'unknown';
  }

  get totalAttempts(): number {
    return this.attempts?.length || 0;
  }

  get lastAttempt(): { timestamp: Date; status: NotificationStatus; error?: string } | null {
    if (!this.attempts || this.attempts.length === 0) {
      return null;
    }
    return this.attempts[this.attempts.length - 1];
  }

  get isDelivered(): boolean {
    return this.status === NotificationStatus.DELIVERED;
  }

  get isRead(): boolean {
    return this.status === NotificationStatus.READ;
  }

  get isFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.status === NotificationStatus.CANCELLED;
  }

  get isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  get isSent(): boolean {
    return this.status === NotificationStatus.SENT;
  }
}
