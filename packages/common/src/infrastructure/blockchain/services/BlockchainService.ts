import { JsonRpcProvider, Contract, formatUnits, parseUnits, TransactionRequest, TransactionReceipt, Wallet } from 'ethers';
import { Network } from '../../../types';
import { BlockchainProvider } from '../providers/BlockchainProvider';
import { ILogger } from '../../../domain/interfaces/ILogger';

export class BlockchainService {
  constructor(private readonly logger: ILogger) {}

  async getGasPrice(network: Network): Promise<bigint> {
    try {
      return await BlockchainProvider.getGasPrice(network);
    } catch (error) {
      this.logger.error('Error getting gas price', { error, network });
      throw error;
    }
  }

  async estimateGas(
    network: Network,
    transaction: TransactionRequest
  ): Promise<bigint> {
    try {
      return await BlockchainProvider.estimateGas(network, transaction);
    } catch (error) {
      this.logger.error('Error estimating gas', { error, network, transaction });
      throw error;
    }
  }

  async getBalance(network: Network, address: string): Promise<bigint> {
    try {
      return await BlockchainProvider.getBalance(network, address);
    } catch (error) {
      this.logger.error('Error getting balance', { error, network, address });
      throw error;
    }
  }

  async getTokenBalance(
    network: Network,
    tokenAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    try {
      return await BlockchainProvider.getTokenBalance(
        network,
        tokenAddress,
        walletAddress
      );
    } catch (error) {
      this.logger.error('Error getting token balance', {
        error,
        network,
        tokenAddress,
        walletAddress,
      });
      throw error;
    }
  }

  async sendTransaction(
    network: Network,
    privateKey: string,
    transaction: TransactionRequest
  ): Promise<string> {
    try {
      const provider = BlockchainProvider.getProvider(network);
      const wallet = new Wallet(privateKey, provider);
      
      const tx = await wallet.sendTransaction(transaction);
      return tx.hash;
    } catch (error) {
      this.logger.error('Error sending transaction', { error, network });
      throw error;
    }
  }

  async waitForTransaction(
    network: Network,
    hash: string
  ): Promise<TransactionReceipt> {
    try {
      return await BlockchainProvider.waitForTransaction(network, hash);
    } catch (error) {
      this.logger.error('Error waiting for transaction', { error, network, hash });
      throw error;
    }
  }

  validateTransaction(network: Network, value: bigint): boolean {
    try {
      return BlockchainProvider.validateTransaction(network, value);
    } catch (error) {
      this.logger.error('Error validating transaction', { error, network, value });
      throw error;
    }
  }

  async isContractAddress(network: Network, address: string): Promise<boolean> {
    try {
      return await BlockchainProvider.isContractAddress(network, address);
    } catch (error) {
      this.logger.error('Error checking contract address', {
        error,
        network,
        address,
      });
      throw error;
    }
  }
}