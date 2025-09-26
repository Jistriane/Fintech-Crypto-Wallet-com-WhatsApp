import { ethers } from 'ethers';
import { IWalletRepository } from '@common/domain/repositories/IWalletRepository';
import { IUserRepository } from '@common/domain/repositories/IUserRepository';
import { ITransactionRepository } from '@common/domain/repositories/ITransactionRepository';
import { SmartWallet } from '@common/domain/entities/SmartWallet';
import { Transaction } from '@common/domain/entities/Transaction';
import { Network, Token, TransactionType } from '@common/types';
import { BlockchainService } from '@common/infrastructure/blockchain/services/BlockchainService';
import { BlockchainProvider } from '@common/infrastructure/blockchain/providers/BlockchainProvider';
import { NotusWhatsAppService } from '../../infrastructure/whatsapp/NotusWhatsAppService';
import { KYC_LEVELS } from '@common/constants/kyc';

export class SmartWalletService {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly userRepository: IUserRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly whatsappService: NotusWhatsAppService
  ) {}

  async createWallet(userId: string, network: Network): Promise<SmartWallet> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar limites de KYC
    if (user.kycLevel === 'LEVEL_0') {
      throw new Error('KYC level too low to create wallet');
    }

    // Criar carteira
    const wallet = ethers.Wallet.createRandom();
    
    // TODO: Implementar criptografia da chave privada
    const privateKeyEncrypted = wallet.privateKey;

    const newWallet = new SmartWallet(
      ethers.utils.id(Date.now().toString()),
      userId,
      wallet.address,
      privateKeyEncrypted,
      network,
      true,
      [],
      new Date(),
      new Date()
    );

    const savedWallet = await this.walletRepository.create(newWallet);

    // Notificar usuário via WhatsApp
    await this.whatsappService.notifyWalletCreated(
      user.phone,
      userId,
      savedWallet.address,
      network
    );

    return savedWallet;
  }

  async transfer(
    walletId: string,
    toAddress: string,
    token: Token,
    amount: ethers.BigNumber
  ): Promise<Transaction> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const user = await this.userRepository.findById(wallet.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar limites de KYC
    const kycLimits = KYC_LEVELS[user.kycLevel];
    if (amount.gt(ethers.utils.parseUnits(kycLimits.singleTransactionLimit.toString(), token.decimals))) {
      throw new Error('Transaction amount exceeds KYC limit');
    }

    // Verificar saldo
    if (!wallet.hasEnoughBalance(token, amount)) {
      throw new Error('Insufficient balance');
    }

    // Criar transação
    const transaction = new Transaction(
      ethers.utils.id(Date.now().toString()),
      walletId,
      'TRANSFER',
      'PENDING',
      wallet.address,
      toAddress,
      token,
      amount,
      undefined,
      undefined,
      new Date(),
      undefined,
      new Date()
    );

    // Salvar transação
    const savedTransaction = await this.transactionRepository.create(transaction);

    // Enviar transação
    try {
      const hash = await BlockchainService.sendTransaction(wallet, transaction);
      transaction.hash = hash;
      await this.transactionRepository.update(transaction);

      // Monitorar transação
      BlockchainService.monitorTransaction(wallet, transaction)
        .then(async (success) => {
          if (success) {
            // Atualizar saldo
            const newBalance = wallet.getBalance(token).sub(amount);
            await this.walletRepository.updateBalance(walletId, token, newBalance);
          }
        });

      return savedTransaction;
    } catch (error) {
      transaction.fail(error.message);
      await this.transactionRepository.update(transaction);
      throw error;
    }
  }

  async getBalance(walletId: string, token: Token): Promise<ethers.BigNumber> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const balance = await BlockchainService.getTokenBalance(wallet, token);
    await this.walletRepository.updateBalance(walletId, token, balance);

    return balance;
  }

  async getAllBalances(walletId: string): Promise<{
    token: Token;
    balance: ethers.BigNumber;
  }[]> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const balances = await Promise.all(
      wallet.balances.map(async (balance) => {
        const currentBalance = await BlockchainService.getTokenBalance(
          wallet,
          balance.token
        );
        
        if (!currentBalance.eq(balance.balance)) {
          await this.walletRepository.updateBalance(
            walletId,
            balance.token,
            currentBalance
          );
        }

        return {
          token: balance.token,
          balance: currentBalance
        };
      })
    );

    return balances;
  }

  async getTransactionHistory(
    walletId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (startDate && endDate) {
      return await this.transactionRepository.findByDateRange(startDate, endDate);
    }

    return await this.transactionRepository.findByWalletId(walletId);
  }

  async deactivateWallet(walletId: string): Promise<void> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const user = await this.userRepository.findById(wallet.userId);
    if (!user) {
      throw new Error('User not found');
    }

    wallet.deactivate();
    await this.walletRepository.update(wallet);

    // Notificar usuário via WhatsApp
    await this.whatsappService.notifyWalletDeactivated(
      user.phone,
      user.id,
      wallet.address
    );
  }

  async validateAddress(address: string, network: Network): Promise<boolean> {
    // Verificar formato do endereço
    if (!ethers.utils.isAddress(address)) {
      return false;
    }

    // Verificar se é um contrato
    const isContract = await BlockchainProvider.isContractAddress(
      network,
      address
    );

    // Para transferências, não permitimos envio direto para contratos
    return !isContract;
  }
}
