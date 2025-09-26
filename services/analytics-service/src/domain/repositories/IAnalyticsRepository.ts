import {
  Analytics,
  AnalyticsType,
  MetricType,
  TimeGranularity
} from '../entities/Analytics';

export interface IAnalyticsRepository {
  create(analytics: Partial<Analytics>): Promise<Analytics>;
  findById(id: string): Promise<Analytics | null>;
  update(id: string, data: Partial<Analytics>): Promise<Analytics>;
  delete(id: string): Promise<void>;
  findByType(type: AnalyticsType): Promise<Analytics[]>;
  findByName(name: string): Promise<Analytics[]>;
  findByMetricType(metricType: MetricType): Promise<Analytics[]>;
  findByGranularity(granularity: TimeGranularity): Promise<Analytics[]>;
  findByDimensions(dimensions: Partial<Analytics['dimensions']>): Promise<Analytics[]>;
  findByTimeRange(
    startTime: Date,
    endTime: Date,
    type?: AnalyticsType,
    name?: string
  ): Promise<Analytics[]>;
  findLatestByType(type: AnalyticsType, limit: number): Promise<Analytics[]>;
  findByThresholdExceeded(
    type: AnalyticsType,
    level: 'warning' | 'critical'
  ): Promise<Analytics[]>;
  getTimeSeries(
    type: AnalyticsType,
    name: string,
    granularity: TimeGranularity,
    startTime: Date,
    endTime: Date,
    dimensions?: Partial<Analytics['dimensions']>
  ): Promise<Analytics[]>;
  aggregateByDimension(
    type: AnalyticsType,
    name: string,
    dimension: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    dimension: string;
    value: string;
    count: number;
  }[]>;
  getStatsByType(type: AnalyticsType): Promise<{
    count: number;
    totalValue: string;
    avgValue: string;
    minValue: string;
    maxValue: string;
  }>;
  getPercentiles(
    type: AnalyticsType,
    name: string,
    percentiles: number[]
  ): Promise<{
    percentile: number;
    value: string;
  }[]>;
  getTrends(
    type: AnalyticsType,
    name: string,
    granularity: TimeGranularity,
    periods: number
  ): Promise<{
    period: Date;
    value: string;
    change: string;
  }[]>;
  getCorrelations(
    type: AnalyticsType,
    name: string,
    otherMetrics: string[]
  ): Promise<{
    metric: string;
    correlation: number;
  }[]>;
  getAnomalies(
    type: AnalyticsType,
    name: string,
    stdDevThreshold: number
  ): Promise<Analytics[]>;
  getTopDimensions(
    type: AnalyticsType,
    name: string,
    dimension: string,
    limit: number
  ): Promise<{
    dimension: string;
    value: string;
    count: number;
  }[]>;
  getDimensionDistribution(
    type: AnalyticsType,
    name: string,
    dimension: string
  ): Promise<{
    dimension: string;
    count: number;
    percentage: number;
  }[]>;
  getMetricSummary(type: AnalyticsType, name: string): Promise<{
    current: string;
    previous: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
    stats: Analytics['stats'];
  }>;
}
