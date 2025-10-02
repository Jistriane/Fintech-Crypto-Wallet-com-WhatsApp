import { BigNumberish } from 'ethers';
import { TokenBalance, Network } from '../../types';

export class SmartWallet {
  private readonly _balances: Map<string, TokenBalance>;

  constructor(
    public readonly address: string,
    public readonly network: Network
  ) {
    this._balances = new Map();
  }

  addBalance(balance: TokenBalance): void {
    this._balances.set(balance.tokenAddress, balance);
  }

  getBalance(tokenAddress: string): TokenBalance | undefined {
    return this._balances.get(tokenAddress);
  }

  getAllBalances(): TokenBalance[] {
    return Array.from(this._balances.values());
  }

  updateBalance(tokenAddress: string, newBalance: BigNumberish): void {
    const balance = this._balances.get(tokenAddress);
    if (balance) {
      this._balances.set(tokenAddress, {
        ...balance,
        balance: newBalance,
      });
    }
  }

  hasToken(tokenAddress: string): boolean {
    return this._balances.has(tokenAddress);
  }

  removeToken(tokenAddress: string): void {
    this._balances.delete(tokenAddress);
  }

  getBalancesCount(): number {
    return this._balances.size;
  }

  getBalancesArray(): TokenBalance[] {
    return Array.from(this._balances.values());
  }
}