import { Wallet, WalletRepository, WalletStats } from '../interfaces/wallet';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

export class PrismaWalletRepository implements WalletRepository {
  private prisma: PrismaClient;
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.prisma = new PrismaClient();
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }

  async findAll(page: number, limit: number, filters?: any) {
    const where = this.buildFilters(filters);
    const [wallets, total] = await Promise.all([
      this.prisma.wallet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true
        }
      }),
      this.prisma.wallet.count({ where })
    ]);

    return { wallets, total };
  }

  async findById(id: string) {
    return this.prisma.wallet.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
  }

  async findByAddress(address: string) {
    return this.prisma.wallet.findUnique({
      where: { address },
      include: {
        user: true
      }
    });
  }

  async create(data: Partial<Wallet>) {
    return this.prisma.wallet.create({
      data: data as any,
      include: {
        user: true
      }
    });
  }

  async update(id: string, data: Partial<Wallet>) {
    return this.prisma.wallet.update({
      where: { id },
      data: data as any,
      include: {
        user: true
      }
    });
  }

  async delete(id: string) {
    await this.prisma.wallet.delete({
      where: { id }
    });
  }

  async getStats(): Promise<WalletStats> {
    const [
      totalWallets,
      activeWallets,
      totalVolume24h,
      totalTransactions24h
    ] = await Promise.all([
      this.prisma.wallet.count(),
      this.prisma.wallet.count({ where: { status: 'active' } }),
      this.prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _sum: {
          amountUsd: true
        }
      }),
      this.prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return {
      totalWallets,
      activeWallets,
      totalVolume24h: totalVolume24h._sum.amountUsd?.toString() || '0',
      totalTransactions24h
    };
  }

  async refreshBalance(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const balance = await this.provider.getBalance(wallet.address);
    const ethPrice = await this.getEthPrice();
    const balanceEth = ethers.utils.formatEther(balance);
    const balanceUsd = parseFloat(balanceEth) * ethPrice;

    return this.prisma.wallet.update({
      where: { id },
      data: {
        balance: {
          native: balanceEth,
          usd: balanceUsd
        },
        lastActivity: new Date()
      },
      include: {
        user: true
      }
    });
  }

  async block(id: string) {
    return this.prisma.wallet.update({
      where: { id },
      data: { status: 'blocked' },
      include: {
        user: true
      }
    });
  }

  async unblock(id: string) {
    return this.prisma.wallet.update({
      where: { id },
      data: { status: 'active' },
      include: {
        user: true
      }
    });
  }

  private async getEthPrice() {
    // Implementar chamada para API de preços (e.g., CoinGecko)
    return 2000; // Preço mockado para exemplo
  }

  private buildFilters(filters?: any) {
    if (!filters) return {};

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.network) {
      where.network = filters.network;
    }

    if (filters.search) {
      where.OR = [
        { address: { contains: filters.search } },
        { user: {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    return where;
  }
}
