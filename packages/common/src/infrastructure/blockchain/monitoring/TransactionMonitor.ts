import { ethers } from 'ethers';
import { BlockchainProvider } from '../providers/BlockchainProvider';
import { BlockchainService } from '../services/BlockchainService';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IWalletRepository } from '../../../domain/repositories/IWalletRepository';
import { Network } from '../../../types';
import { RedisCache } from '../../cache/RedisCache';

export class TransactionMonitor {
  private static readonly MONITOR_PREFIX = 'tx_monitor';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_INTERVAL = 60000; // 1 minuto

  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletRepository: IWalletRepository
  ) {}

  async startMonitoring(): Promise<void> {
    // Monitorar cada rede suportada
    const networks: Network[] = ['POLYGON', 'BSC'];
    
    for (const network of networks) {
      this.monitorNetwork(network);
    }

    // Monitorar transações pendentes
    setInterval(
      () => this.checkPendingTransactions(),
      TransactionMonitor.RETRY_INTERVAL
    );
  }

  private async monitorNetwork(network: Network): Promise<void> {
    const provider = BlockchainProvider.getProvider(network);
    
    provider.on('block', async (blockNumber: number) => {
      try {
        await this.processNewBlock(network, blockNumber);
      } catch (error) {
        console.error(`Error processing block ${blockNumber} on ${network}:`, error);
      }
    });
  }

  private async processNewBlock(network: Network, blockNumber: number): Promise<void> {
    const cacheKey = RedisCache.generateKey(
      TransactionMonitor.MONITOR_PREFIX,
      network,
      'last_block'
    );

    const lastProcessedBlock = await RedisCache.get<number>(cacheKey) || blockNumber - 1;

    if (blockNumber <= lastProcessedBlock) {
      return;
    }

    const provider = BlockchainProvider.getProvider(network);
    const block = await provider.getBlock(blockNumber);

    for (const txHash of block.transactions) {
      await this.checkTransaction(network, txHash);
    }

    await RedisCache.set(cacheKey, blockNumber);
  }

  private async checkTransaction(network: Network, hash: string): Promise<void> {
    const transaction = await this.transactionRepository.findByHash(hash);
    if (!transaction) return;

    const receipt = await BlockchainProvider.getTransactionReceipt(network, hash);
    if (!receipt) return;

    const wallet = await this.walletRepository.findById(transaction.walletId);
    if (!wallet) return;

    const success = receipt.status === 1;

    if (success) {
      transaction.confirm(hash);
    } else {
      transaction.fail('Transaction reverted');
    }

    await this.transactionRepository.update(transaction);
    await BlockchainService.monitorTransaction(wallet, transaction);
  }

  private async checkPendingTransactions(): Promise<void> {
    const pendingTransactions = await this.transactionRepository.findPending();

    for (const transaction of pendingTransactions) {
      const wallet = await this.walletRepository.findById(transaction.walletId);
      if (!wallet) continue;

      const retryCount = await this.getRetryCount(transaction.id);
      
      if (retryCount >= TransactionMonitor.MAX_RETRIES) {
        transaction.fail('Max retries exceeded');
        await this.transactionRepository.update(transaction);
        continue;
      }

      try {
        const receipt = await BlockchainProvider.getTransactionReceipt(
          wallet.network,
          transaction.hash!
        );

        if (receipt) {
          const success = receipt.status === 1;
          
          if (success) {
            transaction.confirm(transaction.hash!);
          } else {
            transaction.fail('Transaction reverted');
          }

          await this.transactionRepository.update(transaction);
          await BlockchainService.monitorTransaction(wallet, transaction);
        } else {
          await this.incrementRetryCount(transaction.id);
        }
      } catch (error) {
        console.error(`Error checking transaction ${transaction.id}:`, error);
        await this.incrementRetryCount(transaction.id);
      }
    }
  }

  private async getRetryCount(transactionId: string): Promise<number> {
    const key = RedisCache.generateKey(
      TransactionMonitor.MONITOR_PREFIX,
      'retry',
      transactionId
    );
    
    return parseInt(await RedisCache.getInstance().get(key) || '0');
  }

  private async incrementRetryCount(transactionId: string): Promise<void> {
    const key = RedisCache.generateKey(
      TransactionMonitor.MONITOR_PREFIX,
      'retry',
      transactionId
    );
    
    await RedisCache.getInstance().incr(key);
  }

  async getNetworkStatus(network: Network): Promise<{
    lastBlock: number;
    pendingTransactions: number;
    gasPrice: string;
  }> {
    const provider = BlockchainProvider.getProvider(network);
    const [blockNumber, gasPrice] = await Promise.all([
      provider.getBlockNumber(),
      provider.getGasPrice()
    ]);

    const pendingTransactions = await this.transactionRepository.findByStatus('PENDING');
    const networkPending = pendingTransactions.filter(tx => 
      tx.token.network === network
    ).length;

    return {
      lastBlock: blockNumber,
      pendingTransactions: networkPending,
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
    };
  }
}
