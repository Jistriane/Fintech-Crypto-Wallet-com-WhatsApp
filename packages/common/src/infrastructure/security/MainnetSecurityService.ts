import { ethers, TransactionRequest } from 'ethers';
import { ILogger } from '../../domain/interfaces/ILogger';
import { Network, TransactionType, TransactionStatus } from '../../types/enums';
import { BlockchainProvider } from '../blockchain/providers/BlockchainProvider';
import { RedisCache } from '../cache/RedisCache';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { MainnetMonitor } from '../blockchain/monitoring/MainnetMonitor';

interface SecurityLimits {
  maxGasPrice: bigint;
  maxTransactionValue: bigint;
  minConfirmations: number;
  maxPendingTransactions: number;
  cooldownPeriod: number; // em segundos
  requiredGuardians: number;
}

interface TransactionValidation {
  isValid: boolean;
  reason?: string;
}

export class MainnetSecurityService {
  private securityLimits: Map<Network, SecurityLimits>;
  private readonly TRANSACTION_CACHE_KEY = 'mainnet_security_transactions';
  private readonly GUARDIAN_APPROVAL_CACHE_KEY = 'mainnet_security_approvals';
  private readonly COOLDOWN_CACHE_KEY = 'mainnet_security_cooldown';

  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly mainnetMonitor: MainnetMonitor,
    private readonly cache: RedisCache,
    private readonly logger: ILogger
  ) {
    this.securityLimits = new Map();
    this.initializeSecurityLimits();
  }

  private initializeSecurityLimits() {
    // Polygon Mainnet
    this.securityLimits.set(Network.POLYGON, {
      maxGasPrice: ethers.parseUnits('300', 'gwei'),
      maxTransactionValue: ethers.parseEther('50000'), // 50k MATIC
      minConfirmations: 15,
      maxPendingTransactions: 10,
      cooldownPeriod: 300, // 5 minutos
      requiredGuardians: 2
    });

    // BSC Mainnet
    this.securityLimits.set(Network.BSC, {
      maxGasPrice: ethers.parseUnits('15', 'gwei'),
      maxTransactionValue: ethers.parseEther('100'), // 100 BNB
      minConfirmations: 20,
      maxPendingTransactions: 10,
      cooldownPeriod: 300, // 5 minutos
      requiredGuardians: 2
    });
  }

  async validateMainnetTransaction(
    network: Network,
    walletId: string,
    transaction: TransactionRequest,
    type: TransactionType
  ): Promise<TransactionValidation> {
    try {
      const limits = this.securityLimits.get(network);
      if (!limits) {
        return { isValid: false, reason: 'Network not supported' };
      }

      // 1. Verifica congestionamento da rede
      const congestion = await this.mainnetMonitor.getNetworkCongestion(network);
      if (congestion === 'HIGH') {
        return { isValid: false, reason: 'Network congestion too high' };
      }

      // 2. Verifica preço do gás
      const gasPrice = transaction.gasPrice ? BigInt(transaction.gasPrice.toString()) : 
                      await this.mainnetMonitor.getRecommendedGasPrice(network);
      
      if (gasPrice > limits.maxGasPrice) {
        return { isValid: false, reason: 'Gas price too high' };
      }

      // 3. Verifica valor da transação
      const value = transaction.value ? BigInt(transaction.value.toString()) : BigInt(0);
      if (value > limits.maxTransactionValue) {
        return { isValid: false, reason: 'Transaction value exceeds limit' };
      }

      // 4. Verifica período de cooldown
      const lastTx = await this.getLastTransaction(walletId);
      if (lastTx) {
        const cooldownEnd = new Date(lastTx.timestamp).getTime() + (limits.cooldownPeriod * 1000);
        if (Date.now() < cooldownEnd) {
          return { isValid: false, reason: 'Cooldown period not elapsed' };
        }
      }

      // 5. Verifica transações pendentes
      const pendingTxs = await this.getPendingTransactions(walletId);
      if (pendingTxs.length >= limits.maxPendingTransactions) {
        return { isValid: false, reason: 'Too many pending transactions' };
      }

      // 6. Verifica aprovações de guardiões para transações grandes
      if (value > limits.maxTransactionValue / BigInt(2)) {
        const approvals = await this.getGuardianApprovals(walletId, transaction.hash as string);
        if (approvals.length < limits.requiredGuardians) {
          return { isValid: false, reason: 'Insufficient guardian approvals' };
        }
      }

      // 7. Verifica blacklist de endereços
      if (transaction.to) {
        const isBlacklisted = await this.isAddressBlacklisted(transaction.to);
        if (isBlacklisted) {
          return { isValid: false, reason: 'Recipient address is blacklisted' };
        }
      }

      // 8. Verifica padrões de comportamento suspeito
      const isSuspicious = await this.detectSuspiciousPattern(walletId, transaction);
      if (isSuspicious) {
        return { isValid: false, reason: 'Suspicious transaction pattern detected' };
      }

      return { isValid: true };

    } catch (error) {
      this.logger.error('Error validating mainnet transaction', error as Error);
      return { isValid: false, reason: 'Validation error' };
    }
  }

  private async getLastTransaction(walletId: string): Promise<{ hash: string; timestamp: string } | null> {
    try {
      const transactions = await this.cache.get<Array<{ hash: string; timestamp: string }>>(
        `${this.TRANSACTION_CACHE_KEY}_${walletId}`
      );
      return transactions ? transactions[transactions.length - 1] : null;
    } catch (error) {
      this.logger.error('Error getting last transaction', error as Error);
      return null;
    }
  }

  private async getPendingTransactions(walletId: string): Promise<string[]> {
    try {
      const transactions = await this.transactionRepository.find({
        walletId,
        status: TransactionStatus.PENDING
      });
      return transactions.map(tx => tx.hash!).filter(hash => !!hash);
    } catch (error) {
      this.logger.error('Error getting pending transactions', error as Error);
      return [];
    }
  }

  private async getGuardianApprovals(walletId: string, txHash: string): Promise<string[]> {
    try {
      return await this.cache.get<string[]>(
        `${this.GUARDIAN_APPROVAL_CACHE_KEY}_${walletId}_${txHash}`
      ) || [];
    } catch (error) {
      this.logger.error('Error getting guardian approvals', error as Error);
      return [];
    }
  }

  private async isAddressBlacklisted(address: string): Promise<boolean> {
    // Implementar integração com serviço de blacklist (ex: Chainalysis, Ciphertrace)
    return false;
  }

  private async detectSuspiciousPattern(
    walletId: string,
    transaction: TransactionRequest
  ): Promise<boolean> {
    try {
      // 1. Verifica frequência de transações
      const recentTxs = await this.getRecentTransactions(walletId);
      if (this.isUnusualFrequency(recentTxs)) {
        return true;
      }

      // 2. Verifica padrão de valores
      if (this.isUnusualValue(recentTxs, transaction.value ? BigInt(transaction.value.toString()) : BigInt(0))) {
        return true;
      }

      // 3. Verifica destinatários comuns
      if (transaction.to && this.isUnusualRecipient(recentTxs, transaction.to)) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error detecting suspicious pattern', error as Error);
      return true; // Em caso de erro, considera suspeito por segurança
    }
  }

  private async getRecentTransactions(walletId: string): Promise<any[]> {
    try {
      const transactions = await this.cache.get<any[]>(
        `${this.TRANSACTION_CACHE_KEY}_${walletId}`
      ) || [];
      return transactions.filter(tx => {
        const txTime = new Date(tx.timestamp).getTime();
        return Date.now() - txTime < 24 * 60 * 60 * 1000; // últimas 24 horas
      });
    } catch (error) {
      this.logger.error('Error getting recent transactions', error as Error);
      return [];
    }
  }

  private isUnusualFrequency(recentTxs: any[]): boolean {
    // Considera suspeito se houver mais de 10 transações na última hora
    const lastHourTxs = recentTxs.filter(tx => {
      const txTime = new Date(tx.timestamp).getTime();
      return Date.now() - txTime < 60 * 60 * 1000;
    });
    return lastHourTxs.length > 10;
  }

  private isUnusualValue(recentTxs: any[], currentValue: bigint): boolean {
    if (recentTxs.length === 0) return false;

    // Calcula média e desvio padrão dos valores
    const values = recentTxs.map(tx => BigInt(tx.value));
    const avg = values.reduce((a, b) => a + b, BigInt(0)) / BigInt(values.length);
    
    // Considera suspeito se o valor for 3x maior que a média
    return currentValue > avg * BigInt(3);
  }

  private isUnusualRecipient(recentTxs: any[], currentRecipient: string): boolean {
    // Considera suspeito se o destinatário nunca foi usado antes
    return !recentTxs.some(tx => tx.to.toLowerCase() === currentRecipient.toLowerCase());
  }

  async addGuardianApproval(
    walletId: string,
    txHash: string,
    guardianAddress: string
  ): Promise<void> {
    try {
      const approvals = await this.getGuardianApprovals(walletId, txHash);
      if (!approvals.includes(guardianAddress)) {
        approvals.push(guardianAddress);
        await this.cache.set(
          `${this.GUARDIAN_APPROVAL_CACHE_KEY}_${walletId}_${txHash}`,
          approvals,
          3600 // 1 hora
        );
      }
    } catch (error) {
      this.logger.error('Error adding guardian approval', error as Error);
      throw error;
    }
  }

  async recordTransaction(
    walletId: string,
    transaction: TransactionRequest,
    network: Network
  ): Promise<void> {
    try {
      const txRecord = {
        hash: transaction.hash,
        to: transaction.to,
        value: transaction.value?.toString(),
        timestamp: new Date().toISOString(),
        network
      };

      const transactions = await this.cache.get<any[]>(
        `${this.TRANSACTION_CACHE_KEY}_${walletId}`
      ) || [];

      transactions.push(txRecord);

      // Mantém apenas as últimas 100 transações
      if (transactions.length > 100) {
        transactions.shift();
      }

      await this.cache.set(
        `${this.TRANSACTION_CACHE_KEY}_${walletId}`,
        transactions,
        86400 // 24 horas
      );
    } catch (error) {
      this.logger.error('Error recording transaction', error as Error);
      throw error;
    }
  }

  async updateSecurityLimits(network: Network, limits: Partial<SecurityLimits>): Promise<void> {
    try {
      const currentLimits = this.securityLimits.get(network);
      if (!currentLimits) {
        throw new Error('Network not supported');
      }

      this.securityLimits.set(network, {
        ...currentLimits,
        ...limits
      });

      this.logger.info(`Security limits updated for ${network}`, limits);
    } catch (error) {
      this.logger.error('Error updating security limits', error as Error);
      throw error;
    }
  }
}
