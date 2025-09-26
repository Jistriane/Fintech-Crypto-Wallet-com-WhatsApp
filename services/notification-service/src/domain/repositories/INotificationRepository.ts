import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationCategory
} from '../entities/Notification';

export interface INotificationRepository {
  create(notification: Partial<Notification>): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  update(id: string, data: Partial<Notification>): Promise<Notification>;
  delete(id: string): Promise<void>;
  findByStatus(status: NotificationStatus): Promise<Notification[]>;
  findByType(type: NotificationType): Promise<Notification[]>;
  findByPriority(priority: NotificationPriority): Promise<Notification[]>;
  findByCategory(category: NotificationCategory): Promise<Notification[]>;
  findPendingNotifications(): Promise<Notification[]>;
  findFailedNotifications(): Promise<Notification[]>;
  findExpiredNotifications(): Promise<Notification[]>;
  findNotificationsForRetry(): Promise<Notification[]>;
  findNotificationsForEscalation(): Promise<Notification[]>;
  markAsSent(id: string, messageId: string, channel: string): Promise<Notification>;
  markAsDelivered(id: string, channel: string): Promise<Notification>;
  markAsRead(id: string, channel: string, deviceInfo?: any): Promise<Notification>;
  markAsFailed(id: string, error: string): Promise<Notification>;
  addAttempt(
    id: string,
    status: NotificationStatus,
    error?: string,
    provider?: string
  ): Promise<Notification>;
  cancel(id: string, reason: string): Promise<Notification>;
  findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Notification[]>;
  findByMetadata(metadata: Partial<Notification['metadata']>): Promise<Notification[]>;
  getNotificationStats(userId: string): Promise<{
    total: number;
    delivered: number;
    read: number;
    failed: number;
    avgDeliveryTime: number;
    avgReadTime: number;
  }>;
  getDeliveryRateByType(type: NotificationType): Promise<{
    total: number;
    delivered: number;
    rate: number;
  }>;
  getFailureRateByType(type: NotificationType): Promise<{
    total: number;
    failed: number;
    rate: number;
  }>;
  countByStatus(status: NotificationStatus): Promise<number>;
  countByType(type: NotificationType): Promise<number>;
  countByPriority(priority: NotificationPriority): Promise<number>;
  countByCategory(category: NotificationCategory): Promise<number>;
  getAverageDeliveryTime(type: NotificationType): Promise<number>;
  getAverageReadTime(type: NotificationType): Promise<number>;
  getNotificationVolume(
    days: number
  ): Promise<{
    date: Date;
    count: number;
  }[]>;
  getTopFailureReasons(limit: number): Promise<{
    error: string;
    count: number;
  }[]>;
}
