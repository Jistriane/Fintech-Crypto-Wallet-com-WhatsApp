import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Wallet } from './Wallet';

@Entity('token_balances')
export class TokenBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, wallet => wallet.tokenBalances)
  wallet: Wallet;

  @Column()
  tokenAddress: string;

  @Column()
  tokenSymbol: string;

  @Column()
  tokenName: string;

  @Column()
  tokenDecimals: number;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  balance: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  balanceUSD: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  priceUSD: string;

  @Column({ type: 'jsonb', nullable: true })
  priceHistory: {
    timestamp: Date;
    price: string;
  }[];

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    logoUrl: string;
    website: string;
    description: string;
    isVerified: boolean;
    contractType: string;
    socialLinks: {
      twitter?: string;
      telegram?: string;
      discord?: string;
    };
  };

  @Column({ type: 'jsonb', default: {} })
  stats: {
    marketCap: string;
    volume24h: string;
    priceChange24h: string;
    priceChange7d: string;
    allTimeHigh: string;
    allTimeHighDate: Date;
  };

  @Column({ type: 'jsonb', default: [] })
  priceAlerts: {
    id: string;
    condition: 'above' | 'below';
    price: string;
    isActive: boolean;
    createdAt: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de domínio
  updateBalance(newBalance: string, newPriceUSD: string): void {
    this.balance = newBalance;
    this.priceUSD = newPriceUSD;
    this.balanceUSD = (parseFloat(newBalance) * parseFloat(newPriceUSD)).toString();

    // Atualiza histórico de preços
    if (!this.priceHistory) {
      this.priceHistory = [];
    }
    this.priceHistory.push({
      timestamp: new Date(),
      price: newPriceUSD
    });

    // Mantém apenas os últimos 30 dias de histórico
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.priceHistory = this.priceHistory.filter(
      entry => new Date(entry.timestamp) >= thirtyDaysAgo
    );
  }

  updateStats(newStats: Partial<TokenBalance['stats']>): void {
    this.stats = {
      ...this.stats,
      ...newStats
    };
  }

  addPriceAlert(condition: 'above' | 'below', price: string): void {
    const alert = {
      id: Math.random().toString(36).substr(2, 9),
      condition,
      price,
      isActive: true,
      createdAt: new Date()
    };
    this.priceAlerts.push(alert);
  }

  removePriceAlert(alertId: string): void {
    this.priceAlerts = this.priceAlerts.filter(alert => alert.id !== alertId);
  }

  togglePriceAlert(alertId: string): void {
    this.priceAlerts = this.priceAlerts.map(alert =>
      alert.id === alertId
        ? { ...alert, isActive: !alert.isActive }
        : alert
    );
  }

  checkPriceAlerts(): { triggered: boolean; alerts: any[] } {
    const triggeredAlerts = this.priceAlerts.filter(alert => {
      if (!alert.isActive) return false;
      const currentPrice = parseFloat(this.priceUSD);
      const targetPrice = parseFloat(alert.price);
      return alert.condition === 'above'
        ? currentPrice >= targetPrice
        : currentPrice <= targetPrice;
    });

    return {
      triggered: triggeredAlerts.length > 0,
      alerts: triggeredAlerts
    };
  }

  get value(): string {
    return this.balanceUSD;
  }

  get formattedBalance(): string {
    return parseFloat(this.balance).toFixed(this.tokenDecimals);
  }

  get performance24h(): string {
    return this.stats.priceChange24h;
  }

  get performance7d(): string {
    return this.stats.priceChange7d;
  }
}
