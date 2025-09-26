import { Repository, EntityRepository, MoreThan } from 'typeorm';
import { TokenBalance } from '../../domain/entities/TokenBalance';
import { ITokenBalanceRepository } from '../../domain/repositories/ITokenBalanceRepository';
import { ILogger } from '@fintech/common';
import { subDays } from 'date-fns';

@EntityRepository(TokenBalance)
export class TokenBalanceRepository implements ITokenBalanceRepository {
  constructor(
    private readonly repository: Repository<TokenBalance>,
    private readonly logger: ILogger
  ) {}

  async create(tokenBalanceData: Partial<TokenBalance>): Promise<TokenBalance> {
    try {
      const tokenBalance = this.repository.create(tokenBalanceData);
      return await this.repository.save(tokenBalance);
    } catch (error) {
      this.logger.error('Error creating token balance', { error, tokenBalanceData });
      throw error;
    }
  }

  async findById(id: string): Promise<TokenBalance | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding token balance by id', { error, id });
      throw error;
    }
  }

  async findByWalletId(walletId: string): Promise<TokenBalance[]> {
    try {
      return await this.repository.find({
        where: { wallet: { id: walletId } }
      });
    } catch (error) {
      this.logger.error('Error finding token balances by wallet id', { error, walletId });
      throw error;
    }
  }

  async findByTokenAddress(walletId: string, tokenAddress: string): Promise<TokenBalance | null> {
    try {
      return await this.repository.findOne({
        where: {
          wallet: { id: walletId },
          tokenAddress
        }
      });
    } catch (error) {
      this.logger.error('Error finding token balance by address', { error, walletId, tokenAddress });
      throw error;
    }
  }

  async update(id: string, data: Partial<TokenBalance>): Promise<TokenBalance> {
    try {
      await this.repository.update(id, data);
      const updatedBalance = await this.findById(id);
      if (!updatedBalance) {
        throw new Error('Token balance not found after update');
      }
      return updatedBalance;
    } catch (error) {
      this.logger.error('Error updating token balance', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting token balance', { error, id });
      throw error;
    }
  }

  async updateBalance(id: string, balance: string, priceUSD: string): Promise<TokenBalance> {
    try {
      const tokenBalance = await this.findById(id);
      if (!tokenBalance) {
        throw new Error('Token balance not found');
      }
      tokenBalance.updateBalance(balance, priceUSD);
      return await this.repository.save(tokenBalance);
    } catch (error) {
      this.logger.error('Error updating token balance amount', { error, id, balance, priceUSD });
      throw error;
    }
  }

  async updateStats(id: string, stats: Partial<TokenBalance['stats']>): Promise<TokenBalance> {
    try {
      const tokenBalance = await this.findById(id);
      if (!tokenBalance) {
        throw new Error('Token balance not found');
      }
      tokenBalance.updateStats(stats);
      return await this.repository.save(tokenBalance);
    } catch (error) {
      this.logger.error('Error updating token stats', { error, id, stats });
      throw error;
    }
  }

  async addPriceAlert(id: string, condition: 'above' | 'below', price: string): Promise<TokenBalance> {
    try {
      const tokenBalance = await this.findById(id);
      if (!tokenBalance) {
        throw new Error('Token balance not found');
      }
      tokenBalance.addPriceAlert(condition, price);
      return await this.repository.save(tokenBalance);
    } catch (error) {
      this.logger.error('Error adding price alert', { error, id, condition, price });
      throw error;
    }
  }

  async removePriceAlert(id: string, alertId: string): Promise<TokenBalance> {
    try {
      const tokenBalance = await this.findById(id);
      if (!tokenBalance) {
        throw new Error('Token balance not found');
      }
      tokenBalance.removePriceAlert(alertId);
      return await this.repository.save(tokenBalance);
    } catch (error) {
      this.logger.error('Error removing price alert', { error, id, alertId });
      throw error;
    }
  }

  async togglePriceAlert(id: string, alertId: string): Promise<TokenBalance> {
    try {
      const tokenBalance = await this.findById(id);
      if (!tokenBalance) {
        throw new Error('Token balance not found');
      }
      tokenBalance.togglePriceAlert(alertId);
      return await this.repository.save(tokenBalance);
    } catch (error) {
      this.logger.error('Error toggling price alert', { error, id, alertId });
      throw error;
    }
  }

  async findTokensWithPriceAlerts(): Promise<TokenBalance[]> {
    try {
      return await this.repository
        .createQueryBuilder('tokenBalance')
        .where('jsonb_array_length(tokenBalance.priceAlerts) > 0')
        .andWhere('tokenBalance.priceAlerts @> :activeAlert', {
          activeAlert: JSON.stringify([{ isActive: true }])
        })
        .getMany();
    } catch (error) {
      this.logger.error('Error finding tokens with price alerts', { error });
      throw error;
    }
  }

  async findTokensBySymbol(symbol: string): Promise<TokenBalance[]> {
    try {
      return await this.repository.find({
        where: { tokenSymbol: symbol }
      });
    } catch (error) {
      this.logger.error('Error finding tokens by symbol', { error, symbol });
      throw error;
    }
  }

  async findTokensByValue(minValueUSD: string): Promise<TokenBalance[]> {
    try {
      return await this.repository.find({
        where: {
          balanceUSD: MoreThan(minValueUSD)
        },
        order: {
          balanceUSD: 'DESC'
        }
      });
    } catch (error) {
      this.logger.error('Error finding tokens by value', { error, minValueUSD });
      throw error;
    }
  }

  async getPortfolioValue(walletId: string): Promise<string> {
    try {
      const result = await this.repository
        .createQueryBuilder('tokenBalance')
        .select('SUM(CAST(tokenBalance.balanceUSD AS DECIMAL))', 'total')
        .where('tokenBalance.wallet.id = :walletId', { walletId })
        .getRawOne();
      return result?.total || '0';
    } catch (error) {
      this.logger.error('Error getting portfolio value', { error, walletId });
      throw error;
    }
  }

  async getPortfolioDistribution(walletId: string): Promise<{
    tokenAddress: string;
    symbol: string;
    percentage: number;
  }[]> {
    try {
      const totalValue = await this.getPortfolioValue(walletId);
      const tokens = await this.findByWalletId(walletId);
      return tokens.map(token => ({
        tokenAddress: token.tokenAddress,
        symbol: token.tokenSymbol,
        percentage: parseFloat(token.balanceUSD) / parseFloat(totalValue) * 100
      }));
    } catch (error) {
      this.logger.error('Error getting portfolio distribution', { error, walletId });
      throw error;
    }
  }

  async getTopTokensByValue(limit: number): Promise<TokenBalance[]> {
    try {
      return await this.repository.find({
        order: {
          balanceUSD: 'DESC'
        },
        take: limit
      });
    } catch (error) {
      this.logger.error('Error getting top tokens by value', { error, limit });
      throw error;
    }
  }

  async getTokenPerformance(id: string, days: number): Promise<{
    timestamp: Date;
    price: string;
  }[]> {
    try {
      const tokenBalance = await this.findById(id);
      if (!tokenBalance) {
        throw new Error('Token balance not found');
      }
      const cutoffDate = subDays(new Date(), days);
      return tokenBalance.priceHistory.filter(
        entry => new Date(entry.timestamp) >= cutoffDate
      );
    } catch (error) {
      this.logger.error('Error getting token performance', { error, id, days });
      throw error;
    }
  }
}
