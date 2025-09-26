import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    phone: z.string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Must be in E.164 format')
      .min(10, 'Phone number must be at least 10 characters')
      .max(15, 'Phone number must not exceed 15 characters'),
    email: z.string()
      .email('Invalid email address')
      .min(5, 'Email must be at least 5 characters')
      .max(255, 'Email must not exceed 255 characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must not exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      )
  })
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Must be in E.164 format'),
    password: z.string()
      .min(8, 'Password is required'),
    deviceInfo: z.object({
      deviceId: z.string().optional(),
      deviceType: z.string().optional(),
      osVersion: z.string().optional(),
      appVersion: z.string().optional()
    }).optional()
  })
});

export const verify2FASchema = z.object({
  body: z.object({
    tempSessionId: z.string()
      .min(32, 'Invalid session ID')
      .max(32, 'Invalid session ID'),
    code: z.string()
      .length(6, 'Verification code must be 6 characters')
      .regex(/^[A-Z0-9]+$/, 'Invalid verification code format')
  })
});

export const verifyPhoneSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    code: z.string()
      .length(6, 'Verification code must be 6 characters')
      .regex(/^[A-Z0-9]+$/, 'Invalid verification code format')
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
      .min(1, 'Refresh token is required')
  })
});

export const deviceSchema = z.object({
  deviceId: z.string()
    .min(1, 'Device ID is required')
    .max(255, 'Device ID must not exceed 255 characters'),
  deviceType: z.string()
    .min(1, 'Device type is required')
    .max(50, 'Device type must not exceed 50 characters'),
  osVersion: z.string()
    .min(1, 'OS version is required')
    .max(50, 'OS version must not exceed 50 characters'),
  appVersion: z.string()
    .min(1, 'App version is required')
    .max(50, 'App version must not exceed 50 characters')
});
