import { SmartWallet } from '../entities/SmartWallet';
import { Network, Token } from '../../types';
import { BigNumber } from 'ethers';

export interface IWalletRepository {
  create(wallet: SmartWallet): Promise<SmartWallet>;
  findById(id: string): Promise<SmartWallet | null>;
  findByUserId(userId: string): Promise<SmartWallet[]>;
  findByAddress(address: string): Promise<SmartWallet | null>;
  update(wallet: SmartWallet): Promise<SmartWallet>;
  updateBalance(walletId: string, token: Token, balance: BigNumber): Promise<SmartWallet>;
  delete(walletId: string): Promise<void>;
  findByNetwork(network: Network): Promise<SmartWallet[]>;
  findActive(): Promise<SmartWallet[]>;
  findInactive(): Promise<SmartWallet[]>;
}
