import { IWalletRepository } from '../repositories/IWalletRepository';
import { ITokenBalanceRepository } from '../repositories/ITokenBalanceRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { BlockchainService } from './BlockchainService';
import { INotificationService, ILogger } from '@fintech/common';
import { Wallet, WalletNetwork, WalletStatus } from '../entities/Wallet';
import { Transaction, TransactionType, TransactionStatus } from '../entities/Transaction';
import { TokenBalance } from '../entities/TokenBalance';
import { ethers } from 'ethers';
import { Redis } from 'ioredis';

interface WalletServiceConfig {
  minConfirmations: number;
  maxPendingTransactions: number;
  autoConfirmThreshold: string;
  defaultGasPrice: string;
  maxGasLimit: string;
}

export class WalletService {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly tokenBalanceRepository: ITokenBalanceRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly blockchainService: BlockchainService,
    private readonly notificationService: INotificationService,
    private readonly logger: ILogger,
    private readonly redis: Redis,
    private readonly config: WalletServiceConfig
  ) {}

  async createWallet(userId: string, network: WalletNetwork): Promise<Wallet> {
    try {
      // Cria carteira na blockchain
      const { address, privateKey } = await this.blockchainService.createWallet();

      // Criptografa chave privada
      const encryptedPrivateKey = await this.encryptPrivateKey(privateKey, userId);

      // Salva no banco
      const wallet = await this.walletRepository.create({
        userId,
        address,
        privateKeyEncrypted: encryptedPrivateKey,
        network,
        status: WalletStatus.ACTIVE,
        settings: {
          defaultGasPrice: this.config.defaultGasPrice,
          autoConfirmThreshold: this.config.autoConfirmThreshold,
          notificationPreferences: {
            largeTransactions: true,
            priceAlerts: true,
            securityAlerts: true
          }
        }
      });

      // Notifica usuário
      await this.notificationService.sendWhatsAppMessage(userId, {
        type: 'wallet_created',
        template: 'wallet_created',
        parameters: [address]
      });

      return wallet;
    } catch (error) {
      this.logger.error('Error creating wallet', { error, userId, network });
      throw error;
    }
  }

  async getWalletBalance(walletId: string): Promise<{
    nativeBalance: string;
    tokens: TokenBalance[];
    totalValueUSD: string;
  }> {
    try {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Busca saldo nativo
      const nativeBalance = await this.blockchainService.getNativeBalance(
        wallet.network,
        wallet.address
      );

      // Busca saldos de tokens
      const tokens = await this.tokenBalanceRepository.findByWalletId(walletId);

      // Atualiza saldos em paralelo
      await Promise.all(
        tokens.map(async token => {
          const balance = await this.blockchainService.getTokenBalance(
            wallet.network,
            token.tokenAddress,
            wallet.address
          );
          await this.tokenBalanceRepository.updateBalance(token.id, balance, token.priceUSD);
        })
      );

      // Calcula valor total
      const totalValueUSD = await this.tokenBalanceRepository.getPortfolioValue(walletId);

      return {
        nativeBalance,
        tokens,
        totalValueUSD
      };
    } catch (error) {
      this.logger.error('Error getting wallet balance', { error, walletId });
      throw error;
    }
  }

  async sendTransaction(
    walletId: string,
    to: string,
    amount: string,
    tokenAddress?: string
  ): Promise<Transaction> {
    try {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Valida endereço
      if (!await this.blockchainService.validateAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      // Verifica limites
      const pendingTxCount = await this.transactionRepository.countByStatus(TransactionStatus.PENDING);
      if (pendingTxCount >= this.config.maxPendingTransactions) {
        throw new Error('Too many pending transactions');
      }

      // Prepara transação
      const provider = await this.blockchainService.getProvider(wallet.network);
      const nonce = await this.blockchainService.getTransactionCount(wallet.network, wallet.address);
      const gasPrice = await this.blockchainService.getGasPrice(wallet.network);

      let transaction: ethers.TransactionRequest;
      if (tokenAddress) {
        // Token transfer
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function transfer(address to, uint256 amount)'],
          provider
        );
        transaction = await tokenContract.transfer.populateTransaction(to, amount);
      } else {
        // Native transfer
        transaction = {
          to,
          value: amount
        };
      }

      transaction.nonce = nonce;
      transaction.gasPrice = gasPrice.standard;

      // Estima gas
      const gasLimit = await this.blockchainService.estimateGas(wallet.network, transaction);
      if (BigInt(gasLimit) > BigInt(this.config.maxGasLimit)) {
        throw new Error('Gas limit too high');
      }
      transaction.gasLimit = gasLimit;

      // Assina transação
      const privateKey = await this.decryptPrivateKey(wallet.privateKeyEncrypted, wallet.userId);
      const signer = new ethers.Wallet(privateKey, provider);
      const signedTx = await signer.signTransaction(transaction);

      // Envia transação
      const txHash = await this.blockchainService.sendTransaction(wallet.network, signedTx);

      // Salva no banco
      const tx = await this.transactionRepository.create({
        wallet,
        hash: txHash,
        from: wallet.address,
        to,
        amount,
        tokenAddress,
        type: TransactionType.SEND,
        status: TransactionStatus.PENDING,
        network: wallet.network,
        gasPrice: gasPrice.standard,
        gasLimit,
        nonce
      });

      // Notifica usuário
      await this.notificationService.sendWhatsAppMessage(wallet.userId, {
        type: 'transaction_sent',
        template: 'transaction_pending',
        parameters: [amount, tokenAddress ? 'token' : 'native', txHash]
      });

      // Inicia monitoramento
      this.monitorTransaction(tx.id);

      return tx;
    } catch (error) {
      this.logger.error('Error sending transaction', { error, walletId, to, amount });
      throw error;
    }
  }

  private async monitorTransaction(transactionId: string): Promise<void> {
    try {
      const transaction = await this.transactionRepository.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const wallet = transaction.wallet;
      const minConfirmations = await this.blockchainService.getRequiredConfirmations(wallet.network);

      const monitor = async () => {
        try {
          const receipt = await this.blockchainService.getTransactionReceipt(
            wallet.network,
            transaction.hash
          );

          if (receipt) {
            if (receipt.status === 1) {
              // Sucesso
              if (receipt.confirmations >= minConfirmations) {
                await this.transactionRepository.updateStatus(
                  transactionId,
                  TransactionStatus.CONFIRMED
                );

                await this.notificationService.sendWhatsAppMessage(wallet.userId, {
                  type: 'transaction_confirmed',
                  template: 'transaction_success',
                  parameters: [transaction.hash]
                });

                return true;
              } else {
                await this.transactionRepository.addConfirmation(
                  transactionId,
                  receipt.confirmations
                );
              }
            } else {
              // Falha
              await this.transactionRepository.updateStatus(
                transactionId,
                TransactionStatus.FAILED,
                'Transaction reverted'
              );

              await this.notificationService.sendWhatsAppMessage(wallet.userId, {
                type: 'transaction_failed',
                template: 'transaction_error',
                parameters: [transaction.hash]
              });

              return true;
            }
          }

          return false;
        } catch (error) {
          this.logger.error('Error monitoring transaction', { error, transactionId });
          return false;
        }
      };

      // Monitora a cada 30 segundos por até 1 hora
      const maxAttempts = 120;
      let attempts = 0;

      const interval = setInterval(async () => {
        attempts++;
        const done = await monitor();
        if (done || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 30000);
    } catch (error) {
      this.logger.error('Error starting transaction monitor', { error, transactionId });
    }
  }

  private async encryptPrivateKey(privateKey: string, userId: string): Promise<string> {
    // Implementar criptografia da chave privada
    return privateKey; // TODO: Implementar criptografia real
  }

  private async decryptPrivateKey(encryptedKey: string, userId: string): Promise<string> {
    // Implementar descriptografia da chave privada
    return encryptedKey; // TODO: Implementar descriptografia real
  }

  async addToken(
    walletId: string,
    tokenAddress: string
  ): Promise<TokenBalance> {
    try {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Verifica se token já existe
      const existingToken = await this.tokenBalanceRepository.findByTokenAddress(
        walletId,
        tokenAddress
      );
      if (existingToken) {
        throw new Error('Token already added');
      }

      // Verifica se é contrato
      const isContract = await this.blockchainService.isContract(
        wallet.network,
        tokenAddress
      );
      if (!isContract) {
        throw new Error('Invalid token contract');
      }

      // Busca informações do token
      const tokenInfo = await this.blockchainService.getTokenInfo(
        wallet.network,
        tokenAddress
      );

      // Busca saldo
      const balance = await this.blockchainService.getTokenBalance(
        wallet.network,
        tokenAddress,
        wallet.address
      );

      // Salva no banco
      return await this.tokenBalanceRepository.create({
        wallet,
        tokenAddress,
        tokenSymbol: tokenInfo.symbol,
        tokenName: tokenInfo.name,
        tokenDecimals: tokenInfo.decimals,
        balance,
        balanceUSD: '0', // TODO: Implementar preço
        priceUSD: '0'
      });
    } catch (error) {
      this.logger.error('Error adding token', { error, walletId, tokenAddress });
      throw error;
    }
  }

  async removeToken(walletId: string, tokenAddress: string): Promise<void> {
    try {
      const token = await this.tokenBalanceRepository.findByTokenAddress(
        walletId,
        tokenAddress
      );
      if (!token) {
        throw new Error('Token not found');
      }

      await this.tokenBalanceRepository.delete(token.id);
    } catch (error) {
      this.logger.error('Error removing token', { error, walletId, tokenAddress });
      throw error;
    }
  }

  async getTransactionHistory(
    walletId: string,
    limit?: number,
    offset?: number
  ): Promise<Transaction[]> {
    try {
      return await this.transactionRepository.findByWalletId(walletId, limit, offset);
    } catch (error) {
      this.logger.error('Error getting transaction history', { error, walletId });
      throw error;
    }
  }

  async updateSettings(
    walletId: string,
    settings: Partial<Wallet['settings']>
  ): Promise<Wallet> {
    try {
      return await this.walletRepository.updateSettings(walletId, settings);
    } catch (error) {
      this.logger.error('Error updating wallet settings', { error, walletId });
      throw error;
    }
  }

  async addTrustedAddress(walletId: string, address: string): Promise<Wallet> {
    try {
      if (!await this.blockchainService.validateAddress(address)) {
        throw new Error('Invalid address');
      }
      return await this.walletRepository.addTrustedAddress(walletId, address);
    } catch (error) {
      this.logger.error('Error adding trusted address', { error, walletId, address });
      throw error;
    }
  }

  async removeTrustedAddress(walletId: string, address: string): Promise<Wallet> {
    try {
      return await this.walletRepository.removeTrustedAddress(walletId, address);
    } catch (error) {
      this.logger.error('Error removing trusted address', { error, walletId, address });
      throw error;
    }
  }

  async backupWallet(walletId: string, backupMethod: string): Promise<Wallet> {
    try {
      return await this.walletRepository.updateBackupInfo(walletId, {
        lastBackupDate: new Date(),
        backupMethod,
        isCloudBackupEnabled: backupMethod === 'cloud'
      });
    } catch (error) {
      this.logger.error('Error backing up wallet', { error, walletId });
      throw error;
    }
  }

  async blockWallet(walletId: string, reason: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      wallet.block(reason);
      await this.walletRepository.save(wallet);

      await this.notificationService.sendWhatsAppMessage(wallet.userId, {
        type: 'wallet_blocked',
        template: 'security_alert',
        parameters: [reason]
      });

      return wallet;
    } catch (error) {
      this.logger.error('Error blocking wallet', { error, walletId });
      throw error;
    }
  }

  async unblockWallet(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      wallet.unblock();
      await this.walletRepository.save(wallet);

      await this.notificationService.sendWhatsAppMessage(wallet.userId, {
        type: 'wallet_unblocked',
        template: 'security_update',
        parameters: []
      });

      return wallet;
    } catch (error) {
      this.logger.error('Error unblocking wallet', { error, walletId });
      throw error;
    }
  }
}
