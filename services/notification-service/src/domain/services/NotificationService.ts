import { INotificationRepository } from '../repositories/INotificationRepository';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationCategory
} from '../entities/Notification';
import { ILogger } from '@fintech/common';
import { Redis } from 'ioredis';
import { Channel } from 'amqplib';

interface NotificationServiceConfig {
  defaultRetryCount: number;
  defaultRetryDelay: number;
  defaultExpirationTime: number;
  whatsappSLA: {
    [key in NotificationPriority]: number;
  };
}

interface NotificationProvider {
  send(notification: Notification): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  getStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }>;
}

export class NotificationService {
  private providers: Map<NotificationType, NotificationProvider>;

  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly logger: ILogger,
    private readonly redis: Redis,
    private readonly messageQueue: Channel,
    private readonly config: NotificationServiceConfig
  ) {
    this.providers = new Map();
    this.startNotificationProcessor();
  }

  registerProvider(type: NotificationType, provider: NotificationProvider): void {
    this.providers.set(type, provider);
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    priority: NotificationPriority;
    category: NotificationCategory;
    template: string;
    parameters: string[];
    metadata?: any;
    preferences?: Partial<Notification['preferences']>;
  }): Promise<Notification> {
    try {
      // Configura preferências padrão
      const preferences = {
        retryCount: 0,
        maxRetries: this.config.defaultRetryCount,
        retryDelay: this.config.defaultRetryDelay,
        expiresAt: new Date(Date.now() + this.config.defaultExpirationTime),
        fallbackChannels: this.getFallbackChannels(data.type),
        ...data.preferences
      };

      // Cria notificação
      const notification = await this.notificationRepository.create({
        ...data,
        status: NotificationStatus.PENDING,
        preferences,
        metrics: {
          retryCount: 0,
          failureCount: 0
        }
      });

      // Publica na fila para processamento
      await this.queueNotification(notification);

      return notification;
    } catch (error) {
      this.logger.error('Error creating notification', { error, data });
      throw error;
    }
  }

  private async queueNotification(notification: Notification): Promise<void> {
    try {
      await this.messageQueue.assertQueue('notifications', {
        durable: true,
        arguments: {
          'x-message-ttl': this.config.defaultExpirationTime,
          'x-dead-letter-exchange': 'notifications.dlx'
        }
      });

      await this.messageQueue.publish(
        '',
        'notifications',
        Buffer.from(JSON.stringify({
          id: notification.id,
          type: notification.type,
          priority: notification.priority
        })),
        {
          persistent: true,
          priority: this.getPriorityValue(notification.priority)
        }
      );
    } catch (error) {
      this.logger.error('Error queueing notification', { error, notificationId: notification.id });
      throw error;
    }
  }

  private async startNotificationProcessor(): Promise<void> {
    try {
      // Configura filas
      await this.messageQueue.assertQueue('notifications', { durable: true });
      await this.messageQueue.assertQueue('notifications.retry', { durable: true });
      await this.messageQueue.assertQueue('notifications.dlq', { durable: true });

      // Processa notificações
      await this.messageQueue.consume('notifications', async (msg) => {
        if (!msg) return;

        try {
          const { id } = JSON.parse(msg.content.toString());
          const notification = await this.notificationRepository.findById(id);

          if (!notification) {
            this.messageQueue.ack(msg);
            return;
          }

          // Verifica se expirou
          if (notification.isExpired()) {
            await this.notificationRepository.cancel(id, 'Notification expired');
            this.messageQueue.ack(msg);
            return;
          }

          // Envia notificação
          const result = await this.sendNotification(notification);

          if (result.success) {
            this.messageQueue.ack(msg);
          } else {
            // Verifica se deve tentar novamente
            if (notification.shouldRetry()) {
              const delay = notification.getNextRetryDelay();
              await this.requeueNotification(notification, delay);
              this.messageQueue.ack(msg);
            } else if (notification.shouldEscalate()) {
              // Tenta próximo canal
              const nextChannel = notification.getNextFallbackChannel();
              if (nextChannel) {
                await this.escalateNotification(notification, nextChannel);
                this.messageQueue.ack(msg);
              } else {
                // Não há mais canais, move para DLQ
                await this.moveToDeadLetter(notification, msg);
              }
            } else {
              // Não há mais tentativas, move para DLQ
              await this.moveToDeadLetter(notification, msg);
            }
          }
        } catch (error) {
          this.logger.error('Error processing notification', {
            error,
            messageId: msg.properties.messageId
          });
          // Rejeita mensagem para reprocessamento
          this.messageQueue.nack(msg, false, true);
        }
      });
    } catch (error) {
      this.logger.error('Error starting notification processor', { error });
      throw error;
    }
  }

  private async sendNotification(notification: Notification): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const provider = this.providers.get(notification.type);
      if (!provider) {
        throw new Error(`Provider not found for type ${notification.type}`);
      }

      const result = await provider.send(notification);

      if (result.success) {
        await this.notificationRepository.markAsSent(
          notification.id,
          result.messageId!,
          notification.type
        );
      } else {
        await this.notificationRepository.addAttempt(
          notification.id,
          NotificationStatus.FAILED,
          result.error
        );
      }

      return result;
    } catch (error) {
      this.logger.error('Error sending notification', {
        error,
        notificationId: notification.id
      });
      await this.notificationRepository.addAttempt(
        notification.id,
        NotificationStatus.FAILED,
        error.message
      );
      return { success: false, error: error.message };
    }
  }

  private async requeueNotification(
    notification: Notification,
    delay: number
  ): Promise<void> {
    try {
      await this.messageQueue.assertQueue('notifications.retry', {
        durable: true,
        arguments: {
          'x-message-ttl': delay,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': 'notifications'
        }
      });

      await this.messageQueue.publish(
        '',
        'notifications.retry',
        Buffer.from(JSON.stringify({
          id: notification.id,
          type: notification.type,
          priority: notification.priority,
          attempt: notification.metrics.retryCount + 1
        })),
        { persistent: true }
      );
    } catch (error) {
      this.logger.error('Error requeueing notification', {
        error,
        notificationId: notification.id
      });
      throw error;
    }
  }

  private async escalateNotification(
    notification: Notification,
    nextChannel: NotificationType
  ): Promise<void> {
    try {
      // Cria nova notificação no próximo canal
      await this.createNotification({
        userId: notification.userId,
        type: nextChannel,
        priority: notification.priority,
        category: notification.category,
        template: notification.template,
        parameters: notification.parameters,
        metadata: {
          ...notification.metadata,
          originalNotificationId: notification.id
        }
      });

      // Marca notificação original como cancelada
      await this.notificationRepository.cancel(
        notification.id,
        `Escalated to ${nextChannel}`
      );
    } catch (error) {
      this.logger.error('Error escalating notification', {
        error,
        notificationId: notification.id,
        nextChannel
      });
      throw error;
    }
  }

  private async moveToDeadLetter(
    notification: Notification,
    msg: any
  ): Promise<void> {
    try {
      await this.messageQueue.assertQueue('notifications.dlq', { durable: true });

      await this.messageQueue.publish(
        '',
        'notifications.dlq',
        msg.content,
        {
          persistent: true,
          headers: {
            'x-first-death-exchange': '',
            'x-first-death-queue': 'notifications',
            'x-first-death-reason': 'rejected'
          }
        }
      );

      await this.notificationRepository.cancel(
        notification.id,
        'Moved to dead letter queue'
      );

      this.messageQueue.ack(msg);
    } catch (error) {
      this.logger.error('Error moving notification to DLQ', {
        error,
        notificationId: notification.id
      });
      throw error;
    }
  }

  private getFallbackChannels(type: NotificationType): NotificationType[] {
    const channels = [
      NotificationType.WHATSAPP,
      NotificationType.SMS,
      NotificationType.EMAIL,
      NotificationType.PUSH
    ];
    const currentIndex = channels.indexOf(type);
    return channels.slice(currentIndex + 1);
  }

  private getPriorityValue(priority: NotificationPriority): number {
    const values = {
      [NotificationPriority.CRITICAL]: 10,
      [NotificationPriority.HIGH]: 7,
      [NotificationPriority.MEDIUM]: 5,
      [NotificationPriority.LOW]: 3
    };
    return values[priority];
  }

  async getNotificationStatus(id: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Se estiver enviada, verifica status no provider
      if (notification.status === NotificationStatus.SENT) {
        const provider = this.providers.get(notification.type);
        if (provider && notification.delivery?.messageId) {
          const status = await provider.getStatus(notification.delivery.messageId);
          if (status.status === 'delivered') {
            await this.notificationRepository.markAsDelivered(id, notification.type);
          } else if (status.status === 'failed') {
            await this.notificationRepository.markAsFailed(id, status.error || 'Unknown error');
          }
        }
      }

      return notification;
    } catch (error) {
      this.logger.error('Error getting notification status', { error, id });
      throw error;
    }
  }

  async markAsRead(id: string, channel: string, deviceInfo?: any): Promise<void> {
    try {
      await this.notificationRepository.markAsRead(id, channel, deviceInfo);
    } catch (error) {
      this.logger.error('Error marking notification as read', { error, id });
      throw error;
    }
  }

  async cancelNotification(id: string, reason: string): Promise<void> {
    try {
      await this.notificationRepository.cancel(id, reason);
    } catch (error) {
      this.logger.error('Error cancelling notification', { error, id });
      throw error;
    }
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    delivered: number;
    read: number;
    failed: number;
    avgDeliveryTime: number;
    avgReadTime: number;
  }> {
    try {
      return await this.notificationRepository.getNotificationStats(userId);
    } catch (error) {
      this.logger.error('Error getting notification stats', { error, userId });
      throw error;
    }
  }

  async getDeliveryRate(type: NotificationType): Promise<{
    total: number;
    delivered: number;
    rate: number;
  }> {
    try {
      return await this.notificationRepository.getDeliveryRateByType(type);
    } catch (error) {
      this.logger.error('Error getting delivery rate', { error, type });
      throw error;
    }
  }

  async getFailureRate(type: NotificationType): Promise<{
    total: number;
    failed: number;
    rate: number;
  }> {
    try {
      return await this.notificationRepository.getFailureRateByType(type);
    } catch (error) {
      this.logger.error('Error getting failure rate', { error, type });
      throw error;
    }
  }

  async getAverageDeliveryTime(type: NotificationType): Promise<number> {
    try {
      return await this.notificationRepository.getAverageDeliveryTime(type);
    } catch (error) {
      this.logger.error('Error getting average delivery time', { error, type });
      throw error;
    }
  }

  async getNotificationVolume(days: number): Promise<{
    date: Date;
    count: number;
  }[]> {
    try {
      return await this.notificationRepository.getNotificationVolume(days);
    } catch (error) {
      this.logger.error('Error getting notification volume', { error, days });
      throw error;
    }
  }

  async getTopFailureReasons(limit: number): Promise<{
    error: string;
    count: number;
  }[]> {
    try {
      return await this.notificationRepository.getTopFailureReasons(limit);
    } catch (error) {
      this.logger.error('Error getting top failure reasons', { error, limit });
      throw error;
    }
  }
}
