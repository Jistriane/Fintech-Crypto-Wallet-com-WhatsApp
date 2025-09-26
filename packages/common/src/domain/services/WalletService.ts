import { ethers, BigNumber } from 'ethers';
import { SmartWallet } from '../entities/SmartWallet';
import { IWalletRepository } from '../repositories/IWalletRepository';
import { Network, Token } from '../../types';
import { NETWORK_LIMITS } from '../../constants/kyc';

export class WalletService {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async createWallet(userId: string, network: Network): Promise<SmartWallet> {
    const wallet = ethers.Wallet.createRandom();
    
    // TODO: Implementar criptografia da chave privada
    const privateKeyEncrypted = wallet.privateKey;

    const newWallet = new SmartWallet(
      ethers.utils.id(Date.now().toString()), // ID único
      userId,
      wallet.address,
      privateKeyEncrypted,
      network,
      true, // ativo por padrão
      [], // balances vazios inicialmente
      new Date(),
      new Date()
    );

    return await this.walletRepository.create(newWallet);
  }

  async validateTransaction(
    wallet: SmartWallet,
    token: Token,
    amount: BigNumber
  ): Promise<boolean> {
    // Verifica se a carteira está ativa
    if (!wallet.isActive) {
      throw new Error('Wallet is not active');
    }

    // Verifica se tem saldo suficiente
    if (!wallet.hasEnoughBalance(token, amount)) {
      throw new Error('Insufficient balance');
    }

    // Verifica limites da rede
    const networkLimit = NETWORK_LIMITS[wallet.network];
    if (amount.gt(ethers.utils.parseUnits(networkLimit.maxSingleTransaction, token.decimals))) {
      throw new Error(`Transaction amount exceeds network limit of ${networkLimit.maxSingleTransaction}`);
    }

    return true;
  }

  async updateWalletBalances(wallet: SmartWallet): Promise<SmartWallet> {
    // TODO: Implementar atualização de saldos via blockchain
    return wallet;
  }

  async getWalletsByUser(userId: string): Promise<SmartWallet[]> {
    return await this.walletRepository.findByUserId(userId);
  }

  async deactivateWallet(walletId: string): Promise<SmartWallet> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    wallet.deactivate();
    return await this.walletRepository.update(wallet);
  }
}
