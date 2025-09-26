import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Decimal } from 'decimal.js';

export enum AnalyticsType {
  USER = 'USER',
  WALLET = 'WALLET',
  TRANSACTION = 'TRANSACTION',
  TOKEN = 'TOKEN',
  LIQUIDITY = 'LIQUIDITY',
  NOTIFICATION = 'NOTIFICATION',
  SYSTEM = 'SYSTEM'
}

export enum MetricType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  RATE = 'RATE',
  DURATION = 'DURATION'
}

export enum TimeGranularity {
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH'
}

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnalyticsType })
  type: AnalyticsType;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: MetricType })
  metricType: MetricType;

  @Column({ type: 'enum', enum: TimeGranularity })
  granularity: TimeGranularity;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  value: string;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    userId?: string;
    walletId?: string;
    tokenAddress?: string;
    network?: string;
    status?: string;
    category?: string;
    [key: string]: string | undefined;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    tags?: string[];
    description?: string;
    unit?: string;
    thresholds?: {
      warning?: string;
      critical?: string;
    };
  };

  @Column({ type: 'jsonb', default: {} })
  stats: {
    min?: string;
    max?: string;
    sum?: string;
    count?: number;
    stdDev?: string;
    percentiles?: {
      p50?: string;
      p90?: string;
      p95?: string;
      p99?: string;
    };
  };

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'int4range', nullable: true })
  timeRange: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de domínio
  updateValue(newValue: string | number | Decimal): void {
    const decimalValue = new Decimal(newValue.toString());
    this.value = decimalValue.toString();

    // Atualiza estatísticas
    if (!this.stats.min || decimalValue.lessThan(this.stats.min)) {
      this.stats.min = decimalValue.toString();
    }
    if (!this.stats.max || decimalValue.greaterThan(this.stats.max)) {
      this.stats.max = decimalValue.toString();
    }

    if (this.metricType === MetricType.SUM || this.metricType === MetricType.AVERAGE) {
      this.stats.sum = this.stats.sum
        ? new Decimal(this.stats.sum).plus(decimalValue).toString()
        : decimalValue.toString();
      this.stats.count = (this.stats.count || 0) + 1;
    }
  }

  addDataPoint(value: string | number | Decimal): void {
    const decimalValue = new Decimal(value.toString());

    switch (this.metricType) {
      case MetricType.COUNT:
        this.value = new Decimal(this.value).plus(1).toString();
        break;

      case MetricType.SUM:
        this.value = new Decimal(this.value).plus(decimalValue).toString();
        break;

      case MetricType.AVERAGE:
        const currentSum = new Decimal(this.value).times(this.stats.count || 0);
        const newCount = (this.stats.count || 0) + 1;
        this.value = currentSum.plus(decimalValue).dividedBy(newCount).toString();
        this.stats.count = newCount;
        break;

      case MetricType.RATE:
        // Taxa é calculada como: (valor atual + novo valor) / intervalo de tempo
        const timeRange = this.getTimeRangeInSeconds();
        if (timeRange > 0) {
          this.value = new Decimal(this.value)
            .plus(decimalValue)
            .dividedBy(timeRange)
            .toString();
        }
        break;

      case MetricType.DURATION:
        // Para durações, mantemos a média móvel
        const alpha = 0.1; // Fator de suavização
        const currentValue = new Decimal(this.value);
        this.value = currentValue
          .times(1 - alpha)
          .plus(decimalValue.times(alpha))
          .toString();
        break;
    }

    this.updateStats(decimalValue);
  }

  private updateStats(value: Decimal): void {
    // Atualiza min/max
    if (!this.stats.min || value.lessThan(this.stats.min)) {
      this.stats.min = value.toString();
    }
    if (!this.stats.max || value.greaterThan(this.stats.max)) {
      this.stats.max = value.toString();
    }

    // Atualiza soma e contagem
    this.stats.sum = this.stats.sum
      ? new Decimal(this.stats.sum).plus(value).toString()
      : value.toString();
    this.stats.count = (this.stats.count || 0) + 1;

    // Atualiza desvio padrão
    if (this.stats.count > 1) {
      const mean = new Decimal(this.stats.sum).dividedBy(this.stats.count);
      const variance = value.minus(mean).pow(2);
      this.stats.stdDev = variance.squareRoot().toString();
    }
  }

  private getTimeRangeInSeconds(): number {
    if (!this.timeRange) return 0;

    const match = this.timeRange.match(/\[(\d+),(\d+)\)/);
    if (!match) return 0;

    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    return end - start;
  }

  checkThresholds(): {
    exceeded: boolean;
    level?: 'warning' | 'critical';
  } {
    if (!this.metadata.thresholds) {
      return { exceeded: false };
    }

    const value = new Decimal(this.value);

    if (
      this.metadata.thresholds.critical &&
      value.greaterThanOrEqualTo(this.metadata.thresholds.critical)
    ) {
      return { exceeded: true, level: 'critical' };
    }

    if (
      this.metadata.thresholds.warning &&
      value.greaterThanOrEqualTo(this.metadata.thresholds.warning)
    ) {
      return { exceeded: true, level: 'warning' };
    }

    return { exceeded: false };
  }

  getPercentile(percentile: number): string | null {
    if (!this.stats.percentiles) {
      return null;
    }

    switch (percentile) {
      case 50:
        return this.stats.percentiles.p50 || null;
      case 90:
        return this.stats.percentiles.p90 || null;
      case 95:
        return this.stats.percentiles.p95 || null;
      case 99:
        return this.stats.percentiles.p99 || null;
      default:
        return null;
    }
  }

  get mean(): string {
    if (!this.stats.sum || !this.stats.count) {
      return '0';
    }
    return new Decimal(this.stats.sum)
      .dividedBy(this.stats.count)
      .toString();
  }

  get range(): string {
    if (!this.stats.max || !this.stats.min) {
      return '0';
    }
    return new Decimal(this.stats.max)
      .minus(this.stats.min)
      .toString();
  }
}
