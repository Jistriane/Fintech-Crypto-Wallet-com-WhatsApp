import { Repository, EntityRepository, Between, LessThan, MoreThan } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationCategory
} from '../../domain/entities/Notification';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { ILogger } from '@fintech/common';
import { subDays } from 'date-fns';

@EntityRepository(Notification)
export class NotificationRepository implements INotificationRepository {
  constructor(
    private readonly repository: Repository<Notification>,
    private readonly logger: ILogger
  ) {}

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const notification = this.repository.create(notificationData);
      return await this.repository.save(notification);
    } catch (error) {
      this.logger.error('Error creating notification', { error, notificationData });
      throw error;
    }
  }

  async findById(id: string): Promise<Notification | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error finding notification by id', { error, id });
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding notifications by user id', { error, userId });
      throw error;
    }
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    try {
      await this.repository.update(id, data);
      const updatedNotification = await this.findById(id);
      if (!updatedNotification) {
        throw new Error('Notification not found after update');
      }
      return updatedNotification;
    } catch (error) {
      this.logger.error('Error updating notification', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting notification', { error, id });
      throw error;
    }
  }

  async findByStatus(status: NotificationStatus): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: { status },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding notifications by status', { error, status });
      throw error;
    }
  }

  async findByType(type: NotificationType): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: { type },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding notifications by type', { error, type });
      throw error;
    }
  }

  async findByPriority(priority: NotificationPriority): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: { priority },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding notifications by priority', { error, priority });
      throw error;
    }
  }

  async findByCategory(category: NotificationCategory): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: { category },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding notifications by category', { error, category });
      throw error;
    }
  }

  async findPendingNotifications(): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: { status: NotificationStatus.PENDING },
        order: { createdAt: 'ASC' }
      });
    } catch (error) {
      this.logger.error('Error finding pending notifications', { error });
      throw error;
    }
  }

  async findFailedNotifications(): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: { status: NotificationStatus.FAILED },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding failed notifications', { error });
      throw error;
    }
  }

  async findExpiredNotifications(): Promise<Notification[]> {
    try {
      return await this.repository
        .createQueryBuilder('notification')
        .where('notification.preferences->\'expiresAt\' < :now', { now: new Date() })
        .andWhere('notification.status NOT IN (:...finalStatuses)', {
          finalStatuses: [
            NotificationStatus.DELIVERED,
            NotificationStatus.READ,
            NotificationStatus.CANCELLED
          ]
        })
        .getMany();
    } catch (error) {
      this.logger.error('Error finding expired notifications', { error });
      throw error;
    }
  }

  async findNotificationsForRetry(): Promise<Notification[]> {
    try {
      return await this.repository
        .createQueryBuilder('notification')
        .where('notification.status = :status', { status: NotificationStatus.FAILED })
        .andWhere('notification.metrics->\'retryCount\' < notification.preferences->\'maxRetries\'')
        .orderBy('notification.createdAt', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error('Error finding notifications for retry', { error });
      throw error;
    }
  }

  async findNotificationsForEscalation(): Promise<Notification[]> {
    try {
      return await this.repository
        .createQueryBuilder('notification')
        .where('notification.status = :status', { status: NotificationStatus.FAILED })
        .andWhere('notification.metrics->\'retryCount\' >= notification.preferences->\'maxRetries\'')
        .andWhere('jsonb_array_length(notification.preferences->\'fallbackChannels\') > 0')
        .orderBy('notification.priority', 'DESC')
        .addOrderBy('notification.createdAt', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error('Error finding notifications for escalation', { error });
      throw error;
    }
  }

  async markAsSent(id: string, messageId: string, channel: string): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.markAsSent(messageId, channel);
      return await this.repository.save(notification);
    } catch (error) {
      this.logger.error('Error marking notification as sent', { error, id, messageId });
      throw error;
    }
  }

  async markAsDelivered(id: string, channel: string): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.markAsDelivered(channel);
      return await this.repository.save(notification);
    } catch (error) {
      this.logger.error('Error marking notification as delivered', { error, id });
      throw error;
    }
  }

  async markAsRead(id: string, channel: string, deviceInfo?: any): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.markAsRead(channel, deviceInfo);
      return await this.repository.save(notification);
    } catch (error) {
      this.logger.error('Error marking notification as read', { error, id });
      throw error;
    }
  }

  async markAsFailed(id: string, error: string): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.markAsFailed(error);
      return await this.repository.save(notification);
    } catch (error) {
      this.logger.error('Error marking notification as failed', { error, id });
      throw error;
    }
  }

  async addAttempt(
    id: string,
    status: NotificationStatus,
    error?: string,
    provider?: string
  ): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.addAttempt(status, error, provider);
      return await this.repository.save(notification);
    } catch (error) {
      this.logger.error('Error adding notification attempt', { error, id, status });
      throw error;
    }
  }

  async cancel(id: string, reason: string): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.cancel(reason);
      return await this.repository.save(notification);
    } catch (error) {
      this.logger.error('Error cancelling notification', { error, id });
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Notification[]> {
    try {
      return await this.repository.find({
        where: {
          createdAt: Between(startDate, endDate)
        },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding notifications by date range', { error, startDate, endDate });
      throw error;
    }
  }

  async findByMetadata(metadata: Partial<Notification['metadata']>): Promise<Notification[]> {
    try {
      const conditions = Object.entries(metadata).map(([key, value]) => ({
        [`metadata->${key}`]: value
      }));
      return await this.repository.find({
        where: conditions,
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding notifications by metadata', { error, metadata });
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
      const [total, delivered, read, failed] = await Promise.all([
        this.repository.count({ where: { userId } }),
        this.repository.count({ where: { userId, status: NotificationStatus.DELIVERED } }),
        this.repository.count({ where: { userId, status: NotificationStatus.READ } }),
        this.repository.count({ where: { userId, status: NotificationStatus.FAILED } })
      ]);

      const deliveryTimes = await this.repository
        .createQueryBuilder('notification')
        .select('AVG(notification.metrics->\'deliveryTime\')', 'avgDeliveryTime')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.metrics->\'deliveryTime\' IS NOT NULL')
        .getRawOne();

      const readTimes = await this.repository
        .createQueryBuilder('notification')
        .select('AVG(notification.metrics->\'readTime\')', 'avgReadTime')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.metrics->\'readTime\' IS NOT NULL')
        .getRawOne();

      return {
        total,
        delivered,
        read,
        failed,
        avgDeliveryTime: deliveryTimes?.avgDeliveryTime || 0,
        avgReadTime: readTimes?.avgReadTime || 0
      };
    } catch (error) {
      this.logger.error('Error getting notification stats', { error, userId });
      throw error;
    }
  }

  async getDeliveryRateByType(type: NotificationType): Promise<{
    total: number;
    delivered: number;
    rate: number;
  }> {
    try {
      const total = await this.repository.count({ where: { type } });
      const delivered = await this.repository.count({
        where: { type, status: NotificationStatus.DELIVERED }
      });
      return {
        total,
        delivered,
        rate: total > 0 ? (delivered / total) * 100 : 0
      };
    } catch (error) {
      this.logger.error('Error getting delivery rate', { error, type });
      throw error;
    }
  }

  async getFailureRateByType(type: NotificationType): Promise<{
    total: number;
    failed: number;
    rate: number;
  }> {
    try {
      const total = await this.repository.count({ where: { type } });
      const failed = await this.repository.count({
        where: { type, status: NotificationStatus.FAILED }
      });
      return {
        total,
        failed,
        rate: total > 0 ? (failed / total) * 100 : 0
      };
    } catch (error) {
      this.logger.error('Error getting failure rate', { error, type });
      throw error;
    }
  }

  async countByStatus(status: NotificationStatus): Promise<number> {
    try {
      return await this.repository.count({ where: { status } });
    } catch (error) {
      this.logger.error('Error counting notifications by status', { error, status });
      throw error;
    }
  }

  async countByType(type: NotificationType): Promise<number> {
    try {
      return await this.repository.count({ where: { type } });
    } catch (error) {
      this.logger.error('Error counting notifications by type', { error, type });
      throw error;
    }
  }

  async countByPriority(priority: NotificationPriority): Promise<number> {
    try {
      return await this.repository.count({ where: { priority } });
    } catch (error) {
      this.logger.error('Error counting notifications by priority', { error, priority });
      throw error;
    }
  }

  async countByCategory(category: NotificationCategory): Promise<number> {
    try {
      return await this.repository.count({ where: { category } });
    } catch (error) {
      this.logger.error('Error counting notifications by category', { error, category });
      throw error;
    }
  }

  async getAverageDeliveryTime(type: NotificationType): Promise<number> {
    try {
      const result = await this.repository
        .createQueryBuilder('notification')
        .select('AVG(notification.metrics->\'deliveryTime\')', 'avgDeliveryTime')
        .where('notification.type = :type', { type })
        .andWhere('notification.metrics->\'deliveryTime\' IS NOT NULL')
        .getRawOne();
      return result?.avgDeliveryTime || 0;
    } catch (error) {
      this.logger.error('Error getting average delivery time', { error, type });
      throw error;
    }
  }

  async getAverageReadTime(type: NotificationType): Promise<number> {
    try {
      const result = await this.repository
        .createQueryBuilder('notification')
        .select('AVG(notification.metrics->\'readTime\')', 'avgReadTime')
        .where('notification.type = :type', { type })
        .andWhere('notification.metrics->\'readTime\' IS NOT NULL')
        .getRawOne();
      return result?.avgReadTime || 0;
    } catch (error) {
      this.logger.error('Error getting average read time', { error, type });
      throw error;
    }
  }

  async getNotificationVolume(days: number): Promise<{ date: Date; count: number }[]> {
    try {
      const startDate = subDays(new Date(), days);
      const results = await this.repository
        .createQueryBuilder('notification')
        .select('DATE(notification.createdAt)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('notification.createdAt >= :startDate', { startDate })
        .groupBy('DATE(notification.createdAt)')
        .orderBy('DATE(notification.createdAt)', 'ASC')
        .getRawMany();

      return results.map(r => ({
        date: new Date(r.date),
        count: parseInt(r.count)
      }));
    } catch (error) {
      this.logger.error('Error getting notification volume', { error, days });
      throw error;
    }
  }

  async getTopFailureReasons(limit: number): Promise<{ error: string; count: number }[]> {
    try {
      return await this.repository
        .createQueryBuilder('notification')
        .select('notification.delivery->\'error\'', 'error')
        .addSelect('COUNT(*)', 'count')
        .where('notification.status = :status', { status: NotificationStatus.FAILED })
        .andWhere('notification.delivery->\'error\' IS NOT NULL')
        .groupBy('notification.delivery->\'error\'')
        .orderBy('count', 'DESC')
        .limit(limit)
        .getRawMany();
    } catch (error) {
      this.logger.error('Error getting top failure reasons', { error, limit });
      throw error;
    }
  }
}
