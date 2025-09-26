import { z } from 'zod';
import { WalletNetwork } from '../../domain/entities/Wallet';

export const createWalletSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    network: z.enum(Object.values(WalletNetwork) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid network' })
    })
  })
});

export const sendTransactionSchema = z.object({
  body: z.object({
    to: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
    amount: z.string()
      .regex(/^\d+$/, 'Amount must be a positive number'),
    tokenAddress: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address')
      .optional(),
    gasPrice: z.string()
      .regex(/^\d+$/, 'Gas price must be a positive number')
      .optional()
  })
});

export const addTokenSchema = z.object({
  body: z.object({
    tokenAddress: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address')
  })
});

export const addPriceAlertSchema = z.object({
  body: z.object({
    condition: z.enum(['above', 'below'], {
      errorMap: () => ({ message: 'Condition must be "above" or "below"' })
    }),
    price: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Price must be a positive number')
  })
});

export const updateSettingsSchema = z.object({
  body: z.object({
    defaultGasPrice: z.string()
      .regex(/^\d+$/, 'Gas price must be a positive number')
      .optional(),
    autoConfirmThreshold: z.string()
      .regex(/^\d+(\.\d+)?$/, 'Threshold must be a positive number')
      .optional(),
    notificationPreferences: z.object({
      largeTransactions: z.boolean(),
      priceAlerts: z.boolean(),
      securityAlerts: z.boolean()
    }).optional()
  })
});

export const addTrustedAddressSchema = z.object({
  body: z.object({
    address: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  })
});

export const backupWalletSchema = z.object({
  body: z.object({
    backupMethod: z.enum(['cloud', 'local'], {
      errorMap: () => ({ message: 'Backup method must be "cloud" or "local"' })
    })
  })
});

export const blockWalletSchema = z.object({
  body: z.object({
    reason: z.string()
      .min(10, 'Reason must be at least 10 characters')
      .max(200, 'Reason must not exceed 200 characters')
  })
});

export const getTransactionHistorySchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive number')
      .transform(Number)
      .optional(),
    offset: z.string()
      .regex(/^\d+$/, 'Offset must be a positive number')
      .transform(Number)
      .optional()
  })
});

export const getTokenPerformanceSchema = z.object({
  query: z.object({
    days: z.string()
      .regex(/^\d+$/, 'Days must be a positive number')
      .transform(Number)
      .min(1, 'Days must be at least 1')
      .max(365, 'Days must not exceed 365')
  })
});

export const getTopTokensSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive number')
      .transform(Number)
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit must not exceed 100')
  })
});
