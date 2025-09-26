import { BigNumber } from 'ethers';
import { Network, Token, TokenBalance } from '../../types';

export class SmartWallet {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly address: string,
    public readonly privateKeyEncrypted: string,
    public readonly network: Network,
    public isActive: boolean,
    public balances: TokenBalance[],
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  public updateBalance(token: Token, newBalance: BigNumber): void {
    const existingBalance = this.balances.find(b => 
      b.token.address.toLowerCase() === token.address.toLowerCase() && 
      b.token.network === token.network
    );

    if (existingBalance) {
      existingBalance.balance = newBalance;
    } else {
      this.balances.push({ token, balance: newBalance });
    }

    this.updatedAt = new Date();
  }

  public getBalance(token: Token): BigNumber {
    const balance = this.balances.find(b => 
      b.token.address.toLowerCase() === token.address.toLowerCase() && 
      b.token.network === token.network
    );

    return balance?.balance || BigNumber.from(0);
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public hasEnoughBalance(token: Token, amount: BigNumber): boolean {
    const balance = this.getBalance(token);
    return balance.gte(amount);
  }
}
