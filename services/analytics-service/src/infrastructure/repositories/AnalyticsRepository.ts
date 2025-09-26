import { Repository, EntityRepository, Between, LessThan, MoreThan } from 'typeorm';
import {
  Analytics,
  AnalyticsType,
  MetricType,
  TimeGranularity
} from '../../domain/entities/Analytics';
import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository';
import { ILogger } from '@fintech/common';
import { Decimal } from 'decimal.js';
import { subPeriods } from 'date-fns';

@EntityRepository(Analytics)
export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(
    private readonly repository: Repository<Analytics>,
    private readonly logger: ILogger
  ) {}

  async create(analyticsData: Partial<Analytics>): Promise<Analytics> {
    try {
      const analytics = this.repository.create(analyticsData);
      return await this.repository.save(analytics);
    } catch (error) {
      this.logger.error('Error creating analytics', { error, analyticsData });
      throw error;
    }
  }

  async findById(id: string): Promise<Analytics | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error finding analytics by id', { error, id });
      throw error;
    }
  }

  async update(id: string, data: Partial<Analytics>): Promise<Analytics> {
    try {
      await this.repository.update(id, data);
      const updatedAnalytics = await this.findById(id);
      if (!updatedAnalytics) {
        throw new Error('Analytics not found after update');
      }
      return updatedAnalytics;
    } catch (error) {
      this.logger.error('Error updating analytics', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting analytics', { error, id });
      throw error;
    }
  }

  async findByType(type: AnalyticsType): Promise<Analytics[]> {
    try {
      return await this.repository.find({
        where: { type },
        order: { timestamp: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding analytics by type', { error, type });
      throw error;
    }
  }

  async findByName(name: string): Promise<Analytics[]> {
    try {
      return await this.repository.find({
        where: { name },
        order: { timestamp: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding analytics by name', { error, name });
      throw error;
    }
  }

  async findByMetricType(metricType: MetricType): Promise<Analytics[]> {
    try {
      return await this.repository.find({
        where: { metricType },
        order: { timestamp: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding analytics by metric type', { error, metricType });
      throw error;
    }
  }

  async findByGranularity(granularity: TimeGranularity): Promise<Analytics[]> {
    try {
      return await this.repository.find({
        where: { granularity },
        order: { timestamp: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding analytics by granularity', { error, granularity });
      throw error;
    }
  }

  async findByDimensions(dimensions: Partial<Analytics['dimensions']>): Promise<Analytics[]> {
    try {
      const conditions = Object.entries(dimensions).map(([key, value]) => ({
        [`dimensions->${key}`]: value
      }));
      return await this.repository.find({
        where: conditions,
        order: { timestamp: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding analytics by dimensions', { error, dimensions });
      throw error;
    }
  }

  async findByTimeRange(
    startTime: Date,
    endTime: Date,
    type?: AnalyticsType,
    name?: string
  ): Promise<Analytics[]> {
    try {
      const where: any = {
        timestamp: Between(startTime, endTime)
      };

      if (type) {
        where.type = type;
      }
      if (name) {
        where.name = name;
      }

      return await this.repository.find({
        where,
        order: { timestamp: 'ASC' }
      });
    } catch (error) {
      this.logger.error('Error finding analytics by time range', {
        error,
        startTime,
        endTime,
        type,
        name
      });
      throw error;
    }
  }

  async findLatestByType(type: AnalyticsType, limit: number): Promise<Analytics[]> {
    try {
      return await this.repository.find({
        where: { type },
        order: { timestamp: 'DESC' },
        take: limit
      });
    } catch (error) {
      this.logger.error('Error finding latest analytics by type', { error, type, limit });
      throw error;
    }
  }

  async findByThresholdExceeded(
    type: AnalyticsType,
    level: 'warning' | 'critical'
  ): Promise<Analytics[]> {
    try {
      return await this.repository
        .createQueryBuilder('analytics')
        .where('analytics.type = :type', { type })
        .andWhere(`analytics.metadata->>'thresholds'->>'${level}' IS NOT NULL`)
        .andWhere(`CAST(analytics.value AS decimal) >= CAST(analytics.metadata->>'thresholds'->>'${level}' AS decimal)`)
        .orderBy('analytics.timestamp', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error('Error finding analytics by threshold exceeded', { error, type, level });
      throw error;
    }
  }

  async getTimeSeries(
    type: AnalyticsType,
    name: string,
    granularity: TimeGranularity,
    startTime: Date,
    endTime: Date,
    dimensions?: Partial<Analytics['dimensions']>
  ): Promise<Analytics[]> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder('analytics')
        .where('analytics.type = :type', { type })
        .andWhere('analytics.name = :name', { name })
        .andWhere('analytics.granularity = :granularity', { granularity })
        .andWhere('analytics.timestamp BETWEEN :startTime AND :endTime', {
          startTime,
          endTime
        });

      if (dimensions) {
        Object.entries(dimensions).forEach(([key, value]) => {
          queryBuilder.andWhere(`analytics.dimensions->>'${key}' = :${key}`, {
            [key]: value
          });
        });
      }

      return await queryBuilder
        .orderBy('analytics.timestamp', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error('Error getting time series', {
        error,
        type,
        name,
        granularity,
        startTime,
        endTime,
        dimensions
      });
      throw error;
    }
  }

  async aggregateByDimension(
    type: AnalyticsType,
    name: string,
    dimension: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    dimension: string;
    value: string;
    count: number;
  }[]> {
    try {
      const results = await this.repository
        .createQueryBuilder('analytics')
        .select(`analytics.dimensions->>'${dimension}'`, 'dimension')
        .addSelect('SUM(CAST(analytics.value AS decimal))', 'value')
        .addSelect('COUNT(*)', 'count')
        .where('analytics.type = :type', { type })
        .andWhere('analytics.name = :name', { name })
        .andWhere('analytics.timestamp BETWEEN :startTime AND :endTime', {
          startTime,
          endTime
        })
        .groupBy(`analytics.dimensions->>'${dimension}'`)
        .getRawMany();

      return results.map(r => ({
        dimension: r.dimension,
        value: r.value,
        count: parseInt(r.count)
      }));
    } catch (error) {
      this.logger.error('Error aggregating by dimension', {
        error,
        type,
        name,
        dimension,
        startTime,
        endTime
      });
      throw error;
    }
  }

  async getStatsByType(type: AnalyticsType): Promise<{
    count: number;
    totalValue: string;
    avgValue: string;
    minValue: string;
    maxValue: string;
  }> {
    try {
      const result = await this.repository
        .createQueryBuilder('analytics')
        .select('COUNT(*)', 'count')
        .addSelect('SUM(CAST(analytics.value AS decimal))', 'totalValue')
        .addSelect('AVG(CAST(analytics.value AS decimal))', 'avgValue')
        .addSelect('MIN(CAST(analytics.value AS decimal))', 'minValue')
        .addSelect('MAX(CAST(analytics.value AS decimal))', 'maxValue')
        .where('analytics.type = :type', { type })
        .getRawOne();

      return {
        count: parseInt(result.count),
        totalValue: result.totalValue || '0',
        avgValue: result.avgValue || '0',
        minValue: result.minValue || '0',
        maxValue: result.maxValue || '0'
      };
    } catch (error) {
      this.logger.error('Error getting stats by type', { error, type });
      throw error;
    }
  }

  async getPercentiles(
    type: AnalyticsType,
    name: string,
    percentiles: number[]
  ): Promise<{
    percentile: number;
    value: string;
  }[]> {
    try {
      const results = await Promise.all(
        percentiles.map(async p => {
          const result = await this.repository
            .createQueryBuilder('analytics')
            .select(`percentile_cont(${p / 100.0}) WITHIN GROUP (ORDER BY CAST(analytics.value AS decimal))`, 'value')
            .where('analytics.type = :type', { type })
            .andWhere('analytics.name = :name', { name })
            .getRawOne();

          return {
            percentile: p,
            value: result.value || '0'
          };
        })
      );

      return results;
    } catch (error) {
      this.logger.error('Error getting percentiles', { error, type, name, percentiles });
      throw error;
    }
  }

  async getTrends(
    type: AnalyticsType,
    name: string,
    granularity: TimeGranularity,
    periods: number
  ): Promise<{
    period: Date;
    value: string;
    change: string;
  }[]> {
    try {
      const analytics = await this.repository
        .createQueryBuilder('analytics')
        .where('analytics.type = :type', { type })
        .andWhere('analytics.name = :name', { name })
        .andWhere('analytics.granularity = :granularity', { granularity })
        .orderBy('analytics.timestamp', 'DESC')
        .take(periods)
        .getMany();

      return analytics.map((a, i) => {
        const previousValue = i < analytics.length - 1
          ? new Decimal(analytics[i + 1].value)
          : new Decimal(0);
        const currentValue = new Decimal(a.value);
        const change = previousValue.isZero()
          ? '0'
          : currentValue.minus(previousValue).dividedBy(previousValue).times(100).toString();

        return {
          period: a.timestamp,
          value: a.value,
          change
        };
      });
    } catch (error) {
      this.logger.error('Error getting trends', { error, type, name, granularity, periods });
      throw error;
    }
  }

  async getCorrelations(
    type: AnalyticsType,
    name: string,
    otherMetrics: string[]
  ): Promise<{
    metric: string;
    correlation: number;
  }[]> {
    try {
      const results = await Promise.all(
        otherMetrics.map(async metric => {
          const result = await this.repository
            .createQueryBuilder('analytics')
            .select('corr(CAST(a1.value AS decimal), CAST(a2.value AS decimal))', 'correlation')
            .from(Analytics, 'a1')
            .innerJoin(Analytics, 'a2', 'a1.timestamp = a2.timestamp')
            .where('a1.type = :type', { type })
            .andWhere('a1.name = :name', { name })
            .andWhere('a2.name = :metric', { metric })
            .getRawOne();

          return {
            metric,
            correlation: parseFloat(result.correlation || '0')
          };
        })
      );

      return results;
    } catch (error) {
      this.logger.error('Error getting correlations', { error, type, name, otherMetrics });
      throw error;
    }
  }

  async getAnomalies(
    type: AnalyticsType,
    name: string,
    stdDevThreshold: number
  ): Promise<Analytics[]> {
    try {
      const stats = await this.repository
        .createQueryBuilder('analytics')
        .select('AVG(CAST(analytics.value AS decimal))', 'mean')
        .addSelect('STDDEV(CAST(analytics.value AS decimal))', 'stddev')
        .where('analytics.type = :type', { type })
        .andWhere('analytics.name = :name', { name })
        .getRawOne();

      const mean = new Decimal(stats.mean || '0');
      const stdDev = new Decimal(stats.stddev || '0');
      const threshold = stdDev.times(stdDevThreshold);

      return await this.repository
        .createQueryBuilder('analytics')
        .where('analytics.type = :type', { type })
        .andWhere('analytics.name = :name', { name })
        .andWhere(
          'ABS(CAST(analytics.value AS decimal) - :mean) > :threshold',
          {
            mean: mean.toString(),
            threshold: threshold.toString()
          }
        )
        .orderBy('analytics.timestamp', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error('Error getting anomalies', { error, type, name, stdDevThreshold });
      throw error;
    }
  }

  async getTopDimensions(
    type: AnalyticsType,
    name: string,
    dimension: string,
    limit: number
  ): Promise<{
    dimension: string;
    value: string;
    count: number;
  }[]> {
    try {
      const results = await this.repository
        .createQueryBuilder('analytics')
        .select(`analytics.dimensions->>'${dimension}'`, 'dimension')
        .addSelect('SUM(CAST(analytics.value AS decimal))', 'value')
        .addSelect('COUNT(*)', 'count')
        .where('analytics.type = :type', { type })
        .andWhere('analytics.name = :name', { name })
        .groupBy(`analytics.dimensions->>'${dimension}'`)
        .orderBy('value', 'DESC')
        .limit(limit)
        .getRawMany();

      return results.map(r => ({
        dimension: r.dimension,
        value: r.value || '0',
        count: parseInt(r.count)
      }));
    } catch (error) {
      this.logger.error('Error getting top dimensions', {
        error,
        type,
        name,
        dimension,
        limit
      });
      throw error;
    }
  }

  async getDimensionDistribution(
    type: AnalyticsType,
    name: string,
    dimension: string
  ): Promise<{
    dimension: string;
    count: number;
    percentage: number;
  }[]> {
    try {
      const total = await this.repository.count({
        where: { type, name }
      });

      const results = await this.repository
        .createQueryBuilder('analytics')
        .select(`analytics.dimensions->>'${dimension}'`, 'dimension')
        .addSelect('COUNT(*)', 'count')
        .where('analytics.type = :type', { type })
        .andWhere('analytics.name = :name', { name })
        .groupBy(`analytics.dimensions->>'${dimension}'`)
        .getRawMany();

      return results.map(r => ({
        dimension: r.dimension,
        count: parseInt(r.count),
        percentage: (parseInt(r.count) / total) * 100
      }));
    } catch (error) {
      this.logger.error('Error getting dimension distribution', {
        error,
        type,
        name,
        dimension
      });
      throw error;
    }
  }

  async getMetricSummary(type: AnalyticsType, name: string): Promise<{
    current: string;
    previous: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
    stats: Analytics['stats'];
  }> {
    try {
      const [current, previous] = await Promise.all([
        this.repository.findOne({
          where: { type, name },
          order: { timestamp: 'DESC' }
        }),
        this.repository
          .createQueryBuilder('analytics')
          .where('analytics.type = :type', { type })
          .andWhere('analytics.name = :name', { name })
          .orderBy('analytics.timestamp', 'DESC')
          .offset(1)
          .limit(1)
          .getOne()
      ]);

      if (!current) {
        return {
          current: '0',
          previous: '0',
          change: '0',
          trend: 'stable',
          stats: {
            min: '0',
            max: '0',
            sum: '0',
            count: 0
          }
        };
      }

      const currentValue = new Decimal(current.value);
      const previousValue = previous ? new Decimal(previous.value) : new Decimal(0);
      const change = previousValue.isZero()
        ? '0'
        : currentValue.minus(previousValue).dividedBy(previousValue).times(100).toString();

      let trend: 'up' | 'down' | 'stable' = 'stable';
      const changeValue = new Decimal(change);
      if (changeValue.abs().greaterThan(1)) {
        trend = changeValue.isPositive() ? 'up' : 'down';
      }

      return {
        current: current.value,
        previous: previous?.value || '0',
        change,
        trend,
        stats: current.stats
      };
    } catch (error) {
      this.logger.error('Error getting metric summary', { error, type, name });
      throw error;
    }
  }
}
