import { User, UserRepository, UserStats } from '../interfaces/user';
import { PrismaClient } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(page: number, limit: number, filters?: any) {
    const where = this.buildFilters(filters);
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          wallets: true
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return { users, total };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        wallets: true
      }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        wallets: true
      }
    });
  }

  async create(data: Partial<User>) {
    return this.prisma.user.create({
      data: data as any,
      include: {
        wallets: true
      }
    });
  }

  async update(id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data: data as any,
      include: {
        wallets: true
      }
    });
  }

  async delete(id: string) {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  async getStats(): Promise<UserStats> {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      kycVerifiedUsers,
      twoFactorEnabledUsers,
      whatsappVerifiedUsers,
      newUsersLast30Days
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'active' } }),
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({ where: { kycStatus: 'verified' } }),
      this.prisma.user.count({ where: { twoFactorEnabled: true } }),
      this.prisma.user.count({ where: { whatsappVerified: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      kycVerifiedUsers,
      twoFactorEnabledUsers,
      whatsappVerifiedUsers,
      newUsersLast30Days
    };
  }

  private buildFilters(filters?: any) {
    if (!filters) return {};

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.kycStatus) {
      where.kycStatus = filters.kycStatus;
    }

    if (filters.twoFactorEnabled !== undefined) {
      where.twoFactorEnabled = filters.twoFactorEnabled;
    }

    if (filters.whatsappVerified !== undefined) {
      where.whatsappVerified = filters.whatsappVerified;
    }

    return where;
  }
}
