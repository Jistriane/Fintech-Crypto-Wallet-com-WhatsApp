import { BigNumberish, formatUnits } from 'ethers';
import { ILogger } from '../interfaces/ILogger';
import { IWalletRepository } from '../repositories/IWalletRepository';
import { Network, TokenBalance } from '../../types';

export class WalletService {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly logger: ILogger
  ) {}

  async createWallet(userId: string, network: Network): Promise<string> {
    try {
      const wallet = await this.walletRepository.save({
        userId,
        network,
        isActive: true,
      });

      return wallet.id;
    } catch (error) {
      this.logger.error('Error creating wallet', { error });
      throw error;
    }
  }

  async getWallet(id: string): Promise<any> {
    try {
      return await this.walletRepository.findOne(id);
    } catch (error) {
      this.logger.error('Error getting wallet', { error });
      throw error;
    }
  }

  async getWalletsByUser(userId: string): Promise<any[]> {
    try {
      return await this.walletRepository.find({ userId });
    } catch (error) {
      this.logger.error('Error getting wallets by user', { error });
      throw error;
    }
  }

  async updateWalletStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.walletRepository.update(id, { isActive });
    } catch (error) {
      this.logger.error('Error updating wallet status', { error });
      throw error;
    }
  }

  async updateTokenBalance(
    id: string,
    tokenAddress: string,
    balance: BigNumberish
  ): Promise<void> {
    try {
      const formattedBalance = formatUnits(balance, 18);
      await this.walletRepository.updateTokenBalance(id, tokenAddress, formattedBalance);
    } catch (error) {
      this.logger.error('Error updating token balance', { error });
      throw error;
    }
  }

  async getTokenBalances(id: string): Promise<TokenBalance[]> {
    try {
      return await this.walletRepository.getTokenBalances(id);
    } catch (error) {
      this.logger.error('Error getting token balances', { error });
      throw error;
    }
  }

  async getActiveWallets(): Promise<any[]> {
    try {
      return await this.walletRepository.find({ isActive: true });
    } catch (error) {
      this.logger.error('Error getting active wallets', { error });
      throw error;
    }
  }

  async getWalletsByNetwork(network: Network): Promise<any[]> {
    try {
      return await this.walletRepository.find({ network });
    } catch (error) {
      this.logger.error('Error getting wallets by network', { error });
      throw error;
    }
  }
}