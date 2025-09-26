import { ethers } from 'ethers';
import { BlockchainProvider } from '../providers/BlockchainProvider';
import { Network, Token, TransactionType } from '../../../types';
import { Transaction } from '../../../domain/entities/Transaction';
import { SmartWallet } from '../../../domain/entities/SmartWallet';
import { WhatsAppSLAMonitor } from '../../monitoring/WhatsAppSLAMonitor';
import { NotificationEscalator } from '../../notifications/NotificationEscalator';

export class BlockchainService {
  static async sendTransaction(
    wallet: SmartWallet,
    transaction: Transaction
  ): Promise<string> {
    const provider = BlockchainProvider.getProvider(wallet.network);
    const signer = new ethers.Wallet(wallet.privateKeyEncrypted, provider);

    // Validar limites da rede
    if (!BlockchainProvider.validateTransaction(wallet.network, transaction.amount)) {
      throw new Error(`Transaction amount exceeds network limit for ${wallet.network}`);
    }

    // Estimar gas
    const gasPrice = await BlockchainProvider.getGasPrice(wallet.network);
    const gasLimit = await this.estimateGasLimit(wallet.network, transaction);

    // Construir transação
    const tx = await this.buildTransaction(
      wallet.network,
      transaction,
      gasPrice,
      gasLimit
    );

    // Enviar transação
    const response = await signer.sendTransaction(tx);

    // Notificar via WhatsApp
    await this.notifyTransactionSent(wallet, transaction, response.hash);

    return response.hash;
  }

  private static async estimateGasLimit(
    network: Network,
    transaction: Transaction
  ): Promise<ethers.BigNumber> {
    const provider = BlockchainProvider.getProvider(network);
    
    const tx = {
      to: transaction.toAddress,
      value: transaction.amount,
      data: '0x'
    };

    if (transaction.type === 'SWAP') {
      // TODO: Implementar estimativa de gas para swaps
      return ethers.BigNumber.from('300000');
    }

    return await provider.estimateGas(tx);
  }

  private static async buildTransaction(
    network: Network,
    transaction: Transaction,
    gasPrice: ethers.BigNumber,
    gasLimit: ethers.BigNumber
  ): Promise<ethers.providers.TransactionRequest> {
    const baseTransaction = {
      to: transaction.toAddress,
      value: transaction.amount,
      gasPrice,
      gasLimit
    };

    switch (transaction.type) {
      case 'TRANSFER':
        return baseTransaction;

      case 'SWAP':
        // TODO: Implementar lógica específica para swaps
        return baseTransaction;

      case 'LIQUIDITY_ADD':
        // TODO: Implementar lógica específica para adição de liquidez
        return baseTransaction;

      case 'LIQUIDITY_REMOVE':
        // TODO: Implementar lógica específica para remoção de liquidez
        return baseTransaction;

      default:
        return baseTransaction;
    }
  }

  private static async notifyTransactionSent(
    wallet: SmartWallet,
    transaction: Transaction,
    hash: string
  ): Promise<void> {
    const notificationId = `tx_sent_${transaction.id}`;
    await WhatsAppSLAMonitor.trackNotificationSent(notificationId, 'HIGH');

    const message = this.formatTransactionMessage(transaction, hash);

    // TODO: Implementar envio real via Notus API
    console.log(`[WhatsApp] Enviando notificação de transação para ${wallet.userId}: ${message}`);

    // Configurar escalonamento
    await NotificationEscalator.handleNotificationTimeout(
      notificationId,
      {
        userId: wallet.userId,
        phone: '', // TODO: Obter telefone do usuário
      },
      'HIGH',
      message
    );
  }

  private static formatTransactionMessage(
    transaction: Transaction,
    hash: string
  ): string {
    const type = this.getTransactionTypeDisplay(transaction.type);
    const amount = ethers.utils.formatUnits(transaction.amount, transaction.token.decimals);
    
    return `Nova transação enviada:\n` +
      `Tipo: ${type}\n` +
      `Valor: ${amount} ${transaction.token.symbol}\n` +
      `Hash: ${hash}`;
  }

  private static getTransactionTypeDisplay(type: TransactionType): string {
    const types = {
      TRANSFER: 'Transferência',
      SWAP: 'Troca',
      LIQUIDITY_ADD: 'Adição de Liquidez',
      LIQUIDITY_REMOVE: 'Remoção de Liquidez',
      FIAT_DEPOSIT: 'Depósito Fiat',
      FIAT_WITHDRAWAL: 'Saque Fiat'
    };

    return types[type];
  }

  static async monitorTransaction(
    wallet: SmartWallet,
    transaction: Transaction
  ): Promise<boolean> {
    try {
      const receipt = await BlockchainProvider.waitForTransaction(
        wallet.network,
        transaction.hash!
      );

      const success = receipt.status === 1;
      await this.notifyTransactionConfirmation(wallet, transaction, success);

      return success;
    } catch (error) {
      await this.notifyTransactionError(wallet, transaction, error.message);
      return false;
    }
  }

  private static async notifyTransactionConfirmation(
    wallet: SmartWallet,
    transaction: Transaction,
    success: boolean
  ): Promise<void> {
    const notificationId = `tx_confirmation_${transaction.id}`;
    await WhatsAppSLAMonitor.trackNotificationSent(notificationId, 'HIGH');

    const message = success
      ? `✅ Transação confirmada!\nHash: ${transaction.hash}`
      : `❌ Transação falhou!\nHash: ${transaction.hash}`;

    // TODO: Implementar envio real via Notus API
    console.log(`[WhatsApp] Enviando confirmação para ${wallet.userId}: ${message}`);
  }

  private static async notifyTransactionError(
    wallet: SmartWallet,
    transaction: Transaction,
    error: string
  ): Promise<void> {
    const notificationId = `tx_error_${transaction.id}`;
    await WhatsAppSLAMonitor.trackNotificationSent(notificationId, 'HIGH');

    const message = `❌ Erro na transação:\n${error}\nHash: ${transaction.hash}`;

    // TODO: Implementar envio real via Notus API
    console.log(`[WhatsApp] Enviando erro para ${wallet.userId}: ${message}`);
  }

  static async getTokenBalance(
    wallet: SmartWallet,
    token: Token
  ): Promise<ethers.BigNumber> {
    if (token.address === 'native') {
      return await BlockchainProvider.getBalance(wallet.network, wallet.address);
    }

    return await BlockchainProvider.getTokenBalance(
      wallet.network,
      token.address,
      wallet.address
    );
  }
}
