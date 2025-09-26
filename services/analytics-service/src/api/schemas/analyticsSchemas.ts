import { z } from 'zod';
import {
  AnalyticsType,
  MetricType,
  TimeGranularity
} from '../../domain/entities/Analytics';

export const trackMetricSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(AnalyticsType) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid analytics type' })
    }),
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must not exceed 100 characters'),
    value: z.string()
      .regex(/^-?\d*\.?\d+$/, 'Value must be a valid number'),
    metricType: z.enum(Object.values(MetricType) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid metric type' })
    }),
    granularity: z.enum(Object.values(TimeGranularity) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid granularity' })
    }).optional(),
    dimensions: z.record(z.string()).optional(),
    metadata: z.object({
      source: z.string().optional(),
      tags: z.array(z.string()).optional(),
      description: z.string().optional(),
      unit: z.string().optional(),
      thresholds: z.object({
        warning: z.string().optional(),
        critical: z.string().optional()
      }).optional()
    }).optional()
  })
});

export const getTimeSeriesSchema = z.object({
  query: z.object({
    startTime: z.string()
      .datetime('Invalid start time format')
      .transform(str => new Date(str)),
    endTime: z.string()
      .datetime('Invalid end time format')
      .transform(str => new Date(str)),
    granularity: z.enum(Object.values(TimeGranularity) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid granularity' })
    }),
    dimensions: z.record(z.string()).optional()
  })
});

export const getDimensionDistributionSchema = z.object({
  query: z.object({
    dimension: z.string()
      .min(1, 'Dimension is required')
      .max(100, 'Dimension must not exceed 100 characters')
  })
});

export const getCorrelationsSchema = z.object({
  query: z.object({
    otherMetrics: z.array(z.string())
      .min(1, 'At least one metric is required')
      .max(10, 'Maximum of 10 metrics allowed')
  })
});

export const getTrendsSchema = z.object({
  query: z.object({
    granularity: z.enum(Object.values(TimeGranularity) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid granularity' })
    }),
    periods: z.string()
      .regex(/^\d+$/, 'Periods must be a positive number')
      .transform(Number)
      .refine(val => val > 0 && val <= 365, {
        message: 'Periods must be between 1 and 365'
      })
  })
});

export const getTopDimensionsSchema = z.object({
  query: z.object({
    dimension: z.string()
      .min(1, 'Dimension is required')
      .max(100, 'Dimension must not exceed 100 characters'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive number')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, {
        message: 'Limit must be between 1 and 100'
      })
  })
});

export const getAnomaliesSchema = z.object({
  query: z.object({
    startTime: z.string()
      .datetime('Invalid start time format')
      .transform(str => new Date(str))
      .optional(),
    endTime: z.string()
      .datetime('Invalid end time format')
      .transform(str => new Date(str))
      .optional()
  })
});

export const getMetricSummarySchema = z.object({
  params: z.object({
    type: z.enum(Object.values(AnalyticsType) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid analytics type' })
    }),
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must not exceed 100 characters')
  })
});

export const getStatsByTypeSchema = z.object({
  params: z.object({
    type: z.enum(Object.values(AnalyticsType) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid analytics type' })
    })
  })
});

export const getPercentilesSchema = z.object({
  query: z.object({
    percentiles: z.array(z.number())
      .min(1, 'At least one percentile is required')
      .max(10, 'Maximum of 10 percentiles allowed')
      .refine(
        arr => arr.every(p => p >= 0 && p <= 100),
        'Percentiles must be between 0 and 100'
      )
  })
});
