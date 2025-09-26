import { z } from 'zod';
import {
  NotificationType,
  NotificationPriority,
  NotificationCategory
} from '../../domain/entities/Notification';

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string()
      .min(1, 'User ID is required'),
    type: z.enum(Object.values(NotificationType) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid notification type' })
    }),
    priority: z.enum(Object.values(NotificationPriority) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid priority' })
    }),
    category: z.enum(Object.values(NotificationCategory) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid category' })
    }),
    template: z.string()
      .min(1, 'Template is required'),
    parameters: z.array(z.string())
      .min(1, 'At least one parameter is required'),
    metadata: z.object({
      transactionId: z.string().optional(),
      walletId: z.string().optional(),
      tokenId: z.string().optional(),
      alertId: z.string().optional(),
      deviceId: z.string().optional(),
      ip: z.string().optional(),
      userAgent: z.string().optional()
    }).optional(),
    preferences: z.object({
      maxRetries: z.number().optional(),
      retryDelay: z.number().optional(),
      expiresAt: z.string().datetime().optional(),
      fallbackChannels: z.array(
        z.enum(Object.values(NotificationType) as [string, ...string[]])
      ).optional()
    }).optional()
  })
});

export const markAsReadSchema = z.object({
  body: z.object({
    channel: z.string()
      .min(1, 'Channel is required'),
    deviceInfo: z.object({
      deviceId: z.string().optional(),
      deviceType: z.string().optional(),
      osVersion: z.string().optional(),
      appVersion: z.string().optional()
    }).optional()
  })
});

export const cancelNotificationSchema = z.object({
  body: z.object({
    reason: z.string()
      .min(10, 'Reason must be at least 10 characters')
      .max(200, 'Reason must not exceed 200 characters')
  })
});

export const getNotificationVolumeSchema = z.object({
  query: z.object({
    days: z.string()
      .regex(/^\d+$/, 'Days must be a positive number')
      .transform(Number)
      .refine(val => val > 0 && val <= 365, {
        message: 'Days must be between 1 and 365'
      })
  })
});

export const getTopFailureReasonsSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive number')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, {
        message: 'Limit must be between 1 and 100'
      })
  })
});

export const validateTemplateSchema = z.object({
  body: z.object({
    template: z.string()
      .min(1, 'Template is required')
  })
});

export const validatePhoneNumberSchema = z.object({
  body: z.object({
    phone: z.string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Must be in E.164 format')
  })
});

export const webhookSchema = z.object({
  body: z.object({
    type: z.string()
      .min(1, 'Webhook type is required'),
    message: z.object({
      id: z.string(),
      status: z.string(),
      errors: z.array(
        z.object({
          code: z.string(),
          message: z.string()
        })
      ).optional()
    })
  })
});
