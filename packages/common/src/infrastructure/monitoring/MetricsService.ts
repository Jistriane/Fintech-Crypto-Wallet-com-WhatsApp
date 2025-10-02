import { Repository } from 'typeorm';
import { ILogger } from '../../domain/interfaces/ILogger';
import { NotusWhatsAppService } from '../../../services/kyc/src/infrastructure/whatsapp/NotusWhatsAppService';
import { UserEntity } from '../database/entities/UserEntity';
import { WalletEntity } from '../database/entities/WalletEntity';
import { TransactionEntity } from '../database/entities/TransactionEntity';
import { TokenBalanceEntity } from '../database/entities/TokenBalanceEntity';
import { KYCLevel, KYCStatus, Network, TransactionStatus } from '../../types';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface MetricEntry {
  timestamp: Date;
  value: number;
}

interface TokenDistribution {
  token: string;
  amount: number;
}

export class MetricsService {
  constructor(
    private readonly userRepository: Repository<UserEntity>,
    private readonly walletRepository: Repository<WalletEntity>,
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly tokenBalanceRepository: Repository<TokenBalanceEntity>,
    private readonly whatsappService: NotusWhatsAppService,
    private readonly logger: ILogger
  ) {}

  private getTimeRange(timeframe: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;

    switch (timeframe) {
      case '24h':
        start = subDays(end, 1);
        break;
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      default:
        start = subDays(end, 7);
    }

    return {
      start: startOfDay(start),
      end: endOfDay(end),
    };
  }

  async getTransactionMetrics(timeframe: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    volume: number;
    avgValue: number;
    byNetwork: Record<Network, number>;
  }> {
    const { start, end } = this.getTimeRange(timeframe);

    const transactions = await this.transactionRepository.find({
      where: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    });

    const total = transactions.length;
    const successful = transactions.filter(
      tx => tx.status === TransactionStatus.COMPLETED
    ).length;
    const failed = transactions.filter(
      tx => tx.status === TransactionStatus.FAILED
    ).length;
    const pending = transactions.filter(
      tx => tx.status === TransactionStatus.PENDING
    ).length;

    const volume = transactions
      .filter(tx => tx.status === TransactionStatus.COMPLETED)
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    const avgValue = successful > 0 ? volume / successful : 0;

    const byNetwork = transactions.reduce((acc, tx) => {
      acc[tx.network] = (acc[tx.network] || 0) + 1;
      return acc;
    }, {} as Record<Network, number>);

    return {
      total,
      successful,
      failed,
      pending,
      volume,
      avgValue,
      byNetwork,
    };
  }

  async getUserMetrics(timeframe: string): Promise<{
    total: number;
    active: number;
    byKYCLevel: Record<KYCLevel, number>;
    byKYCStatus: Record<KYCStatus, number>;
    whatsappOptIn: number;
  }> {
    const { start, end } = this.getTimeRange(timeframe);

    const users = await this.userRepository.find({
      where: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    });

    const total = users.length;
    const active = users.filter(user => user.wallets.length > 0).length;
    const whatsappOptIn = users.filter(user => user.whatsappOptIn).length;

    const byKYCLevel = users.reduce((acc, user) => {
      acc[user.kycLevel] = (acc[user.kycLevel] || 0) + 1;
      return acc;
    }, {} as Record<KYCLevel, number>);

    const byKYCStatus = users.reduce((acc, user) => {
      acc[user.kycStatus] = (acc[user.kycStatus] || 0) + 1;
      return acc;
    }, {} as Record<KYCStatus, number>);

    return {
      total,
      active,
      byKYCLevel,
      byKYCStatus,
      whatsappOptIn,
    };
  }

  async getWalletMetrics(timeframe: string): Promise<{
    total: number;
    active: number;
    byNetwork: Record<Network, number>;
    avgBalances: Record<Network, number>;
  }> {
    const { start, end } = this.getTimeRange(timeframe);

    const wallets = await this.walletRepository.find({
      where: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
      relations: ['balances'],
    });

    const total = wallets.length;
    const active = wallets.filter(wallet => wallet.isActive).length;

    const byNetwork = wallets.reduce((acc, wallet) => {
      acc[wallet.network] = (acc[wallet.network] || 0) + 1;
      return acc;
    }, {} as Record<Network, number>);

    const avgBalances = {} as Record<Network, number>;
    for (const network of Object.values(Network)) {
      const networkWallets = wallets.filter(w => w.network === network);
      const totalBalance = networkWallets.reduce(
        (sum, wallet) =>
          sum +
          wallet.balances.reduce(
            (walletSum, balance) => walletSum + parseFloat(balance.balance),
            0
          ),
        0
      );
      avgBalances[network] =
        networkWallets.length > 0 ? totalBalance / networkWallets.length : 0;
    }

    return {
      total,
      active,
      byNetwork,
      avgBalances,
    };
  }

  async getKYCMetrics(timeframe: string): Promise<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    byLevel: Record<KYCLevel, number>;
  }> {
    const { start, end } = this.getTimeRange(timeframe);

    const users = await this.userRepository.find({
      where: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    });

    const total = users.length;
    const approved = users.filter(
      user => user.kycStatus === KYCStatus.APPROVED
    ).length;
    const rejected = users.filter(
      user => user.kycStatus === KYCStatus.REJECTED
    ).length;
    const pending = users.filter(
      user => user.kycStatus === KYCStatus.PENDING
    ).length;

    const byLevel = users.reduce((acc, user) => {
      acc[user.kycLevel] = (acc[user.kycLevel] || 0) + 1;
      return acc;
    }, {} as Record<KYCLevel, number>);

    return {
      total,
      approved,
      rejected,
      pending,
      byLevel,
    };
  }

  async getWhatsAppMetrics(timeframe: string): Promise<{
    totalMessages: number;
    optInRate: number;
    messageDeliveryRate: number;
    responseRate: number;
  }> {
    const { start, end } = this.getTimeRange(timeframe);

    const users = await this.userRepository.find({
      where: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    });

    const totalUsers = users.length;
    const optInUsers = users.filter(user => user.whatsappOptIn).length;
    const optInRate = totalUsers > 0 ? (optInUsers / totalUsers) * 100 : 0;

    // These metrics would come from the WhatsApp service
    const messageDeliveryRate = 95; // Example value
    const responseRate = 75; // Example value

    return {
      totalMessages: optInUsers * 2, // Example calculation
      optInRate,
      messageDeliveryRate,
      responseRate,
    };
  }

  async getSystemMetrics(): Promise<{
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    apiLatency: number;
    errorRate: number;
  }> {
    // These metrics would come from monitoring services like Prometheus
    return {
      cpuUsage: 45, // Example values
      memoryUsage: 60,
      diskUsage: 35,
      apiLatency: 150,
      errorRate: 0.5,
    };
  }

  async getTransactionVolume(
    timeframe: string,
    network: string
  ): Promise<Array<{ date: string; volume: number }>> {
    const { start, end } = this.getTimeRange(timeframe);

    const transactions = await this.transactionRepository.find({
      where: {
        network,
        status: TransactionStatus.COMPLETED,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    });

    const volumeByDay = new Map<string, number>();
    transactions.forEach(tx => {
      const date = tx.createdAt.toISOString().split('T')[0];
      const volume = parseFloat(tx.amount);
      volumeByDay.set(date, (volumeByDay.get(date) || 0) + volume);
    });

    return Array.from(volumeByDay.entries()).map(([date, volume]) => ({
      date,
      volume,
    }));
  }

  async getTokenDistribution(network: string): Promise<TokenDistribution[]> {
    const balances = await this.tokenBalanceRepository.find({
      where: {
        network,
      },
    });

    const distribution = new Map<string, number>();
    balances.forEach(balance => {
      const amount = parseFloat(balance.balance);
      distribution.set(
        balance.symbol,
        (distribution.get(balance.symbol) || 0) + amount
      );
    });

    return Array.from(distribution.entries()).map(([token, amount]) => ({
      token,
      amount,
    }));
  }
}