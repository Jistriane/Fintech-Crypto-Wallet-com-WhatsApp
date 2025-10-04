import { Token, TokenRepository, TokenStats } from '../interfaces/token';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

// ABI mínimo para consulta de saldo ERC20
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

export class PrismaTokenRepository implements TokenRepository {
  private prisma: PrismaClient;
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.prisma = new PrismaClient();
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }

  async findAll(page: number, limit: number, filters?: any) {
    const where = this.buildFilters(filters);
    const [tokens, total] = await Promise.all([
      this.prisma.token.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.token.count({ where })
    ]);

    return { tokens, total };
  }

  async findById(id: string) {
    return this.prisma.token.findUnique({
      where: { id }
    });
  }

  async findByAddress(address: string) {
    return this.prisma.token.findUnique({
      where: { address }
    });
  }

  async create(data: Partial<Token>) {
    // Verifica se o token existe na blockchain
    const tokenContract = new ethers.Contract(
      data.address!,
      ERC20_ABI,
      this.provider
    );

    try {
      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals()
      ]);

      return this.prisma.token.create({
        data: {
          ...data,
          symbol,
          name,
          decimals
        } as any
      });
    } catch (error) {
      throw new Error('Invalid token contract');
    }
  }

  async update(id: string, data: Partial<Token>) {
    return this.prisma.token.update({
      where: { id },
      data: data as any
    });
  }

  async delete(id: string) {
    await this.prisma.token.delete({
      where: { id }
    });
  }

  async getStats(): Promise<TokenStats> {
    const [
      totalTokens,
      activeTokens,
      volumeStats,
      marketCapStats
    ] = await Promise.all([
      this.prisma.token.count(),
      this.prisma.token.count({ where: { status: 'active' } }),
      this.prisma.token.aggregate({
        _sum: {
          volume24h: true
        }
      }),
      this.prisma.token.aggregate({
        _sum: {
          marketCap: true
        }
      })
    ]);

    return {
      totalTokens,
      activeTokens,
      totalVolume24h: volumeStats._sum.volume24h || 0,
      totalMarketCap: marketCapStats._sum.marketCap || 0
    };
  }

  async refreshPrice(id: string) {
    const token = await this.prisma.token.findUnique({
      where: { id }
    });

    if (!token) {
      throw new Error('Token not found');
    }

    // Implementar chamada para API de preços (e.g., CoinGecko)
    const price = await this.getTokenPrice(token.address);

    return this.prisma.token.update({
      where: { id },
      data: {
        price: {
          usd: price.usd,
          brl: price.brl,
          change24h: price.change24h
        }
      }
    });
  }

  async block(id: string) {
    return this.prisma.token.update({
      where: { id },
      data: { status: 'blocked' }
    });
  }

  async unblock(id: string) {
    return this.prisma.token.update({
      where: { id },
      data: { status: 'active' }
    });
  }

  private async getTokenPrice(address: string) {
    // Implementar chamada para API de preços (e.g., CoinGecko)
    return {
      usd: 1,
      brl: 5,
      change24h: 0
    };
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
        { symbol: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return where;
  }
}
