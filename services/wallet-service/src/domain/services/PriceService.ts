import { ITokenBalanceRepository } from '../repositories/ITokenBalanceRepository';
import { INotificationService, ILogger } from '@fintech/common';
import { Redis } from 'ioredis';
import axios from 'axios';

interface PriceServiceConfig {
  priceUpdateInterval: number;
  priceAlertThreshold: number;
  priceCacheDuration: number;
  coingeckoApiKey: string;
}

export class PriceService {
  constructor(
    private readonly tokenBalanceRepository: ITokenBalanceRepository,
    private readonly notificationService: INotificationService,
    private readonly logger: ILogger,
    private readonly redis: Redis,
    private readonly config: PriceServiceConfig
  ) {
    this.startPriceUpdateJob();
  }

  private startPriceUpdateJob(): void {
    setInterval(async () => {
      try {
        await this.updateAllPrices();
      } catch (error) {
        this.logger.error('Error in price update job', { error });
      }
    }, this.config.priceUpdateInterval);
  }

  async updateAllPrices(): Promise<void> {
    try {
      // Busca todos os tokens com alertas de preço
      const tokens = await this.tokenBalanceRepository.findTokensWithPriceAlerts();

      // Atualiza preços em lotes
      const batchSize = 100;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        await Promise.all(
          batch.map(token => this.updateTokenPrice(token.id, token.tokenAddress))
        );
      }
    } catch (error) {
      this.logger.error('Error updating all prices', { error });
      throw error;
    }
  }

  async updateTokenPrice(tokenId: string, tokenAddress: string): Promise<void> {
    try {
      // Verifica cache
      const cachedPrice = await this.redis.get(`price:${tokenAddress}`);
      if (cachedPrice) {
        await this.tokenBalanceRepository.updateBalance(tokenId, undefined, cachedPrice);
        return;
      }

      // Busca preço da API
      const price = await this.fetchTokenPrice(tokenAddress);

      // Salva no cache
      await this.redis.set(
        `price:${tokenAddress}`,
        price.toString(),
        'EX',
        this.config.priceCacheDuration
      );

      // Atualiza token
      const token = await this.tokenBalanceRepository.updateBalance(
        tokenId,
        undefined,
        price.toString()
      );

      // Verifica alertas
      const { triggered, alerts } = token.checkPriceAlerts();
      if (triggered) {
        await Promise.all(
          alerts.map(async alert => {
            const wallet = token.wallet;
            await this.notificationService.sendWhatsAppMessage(wallet.userId, {
              type: 'price_alert',
              template: 'price_alert',
              parameters: [
                token.tokenSymbol,
                alert.condition === 'above' ? 'acima' : 'abaixo',
                alert.price,
                price.toString()
              ]
            });
          })
        );
      }
    } catch (error) {
      this.logger.error('Error updating token price', { error, tokenId, tokenAddress });
      throw error;
    }
  }

  private async fetchTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum`,
        {
          params: {
            contract_addresses: tokenAddress,
            vs_currencies: 'usd',
            x_cg_pro_api_key: this.config.coingeckoApiKey
          }
        }
      );

      if (!response.data[tokenAddress.toLowerCase()]) {
        throw new Error('Price not found');
      }

      return response.data[tokenAddress.toLowerCase()].usd;
    } catch (error) {
      this.logger.error('Error fetching token price', { error, tokenAddress });
      throw error;
    }
  }

  async addPriceAlert(
    tokenId: string,
    condition: 'above' | 'below',
    price: string
  ): Promise<void> {
    try {
      await this.tokenBalanceRepository.addPriceAlert(tokenId, condition, price);
    } catch (error) {
      this.logger.error('Error adding price alert', { error, tokenId, condition, price });
      throw error;
    }
  }

  async removePriceAlert(tokenId: string, alertId: string): Promise<void> {
    try {
      await this.tokenBalanceRepository.removePriceAlert(tokenId, alertId);
    } catch (error) {
      this.logger.error('Error removing price alert', { error, tokenId, alertId });
      throw error;
    }
  }

  async togglePriceAlert(tokenId: string, alertId: string): Promise<void> {
    try {
      await this.tokenBalanceRepository.togglePriceAlert(tokenId, alertId);
    } catch (error) {
      this.logger.error('Error toggling price alert', { error, tokenId, alertId });
      throw error;
    }
  }

  async getTokenPerformance(
    tokenId: string,
    days: number
  ): Promise<{
    timestamp: Date;
    price: string;
  }[]> {
    try {
      return await this.tokenBalanceRepository.getTokenPerformance(tokenId, days);
    } catch (error) {
      this.logger.error('Error getting token performance', { error, tokenId, days });
      throw error;
    }
  }

  async getPortfolioDistribution(walletId: string): Promise<{
    tokenAddress: string;
    symbol: string;
    percentage: number;
  }[]> {
    try {
      return await this.tokenBalanceRepository.getPortfolioDistribution(walletId);
    } catch (error) {
      this.logger.error('Error getting portfolio distribution', { error, walletId });
      throw error;
    }
  }

  async getTopTokensByValue(limit: number): Promise<any[]> {
    try {
      return await this.tokenBalanceRepository.getTopTokensByValue(limit);
    } catch (error) {
      this.logger.error('Error getting top tokens by value', { error, limit });
      throw error;
    }
  }
}
