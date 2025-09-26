import { Repository, DataSource } from 'typeorm';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { SmartWallet } from '../../domain/entities/SmartWallet';
import { WalletEntity } from '../database/entities/WalletEntity';
import { TokenBalanceEntity } from '../database/entities/TokenBalanceEntity';
import { Network, Token } from '../../types';
import { RedisCache } from '../cache/RedisCache';
import { BigNumber } from 'ethers';

export class WalletRepository implements IWalletRepository {
  private readonly walletRepository: Repository<WalletEntity>;
  private readonly balanceRepository: Repository<TokenBalanceEntity>;
  private readonly cacheKeyPrefix = 'wallet';

  constructor(private readonly dataSource: DataSource) {
    this.walletRepository = dataSource.getRepository(WalletEntity);
    this.balanceRepository = dataSource.getRepository(TokenBalanceEntity);
  }

  private toDomain(entity: WalletEntity): SmartWallet {
    const balances = entity.balances?.map(balance => ({
      token: {
        address: balance.tokenAddress,
        symbol: balance.symbol,
        decimals: balance.decimals,
        network: balance.network
      },
      balance: BigNumber.from(balance.balance)
    })) || [];

    return new SmartWallet(
      entity.id,
      entity.userId,
      entity.address,
      entity.privateKeyEncrypted,
      entity.network,
      entity.isActive,
      balances,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(domain: SmartWallet): Partial<WalletEntity> {
    return {
      id: domain.id,
      userId: domain.userId,
      address: domain.address,
      privateKeyEncrypted: domain.privateKeyEncrypted,
      network: domain.network,
      isActive: domain.isActive
    };
  }

  async create(wallet: SmartWallet): Promise<SmartWallet> {
    const entity = await this.walletRepository.save(this.toEntity(wallet));
    
    // Criar balances
    if (wallet.balances.length > 0) {
      const balanceEntities = wallet.balances.map(balance => ({
        id: ethers.utils.id(Date.now().toString()),
        walletId: wallet.id,
        tokenAddress: balance.token.address,
        symbol: balance.token.symbol,
        decimals: balance.token.decimals,
        network: balance.token.network,
        balance: balance.balance.toString()
      }));
      
      await this.balanceRepository.save(balanceEntities);
    }

    return this.toDomain(entity as WalletEntity);
  }

  async findById(id: string): Promise<SmartWallet | null> {
    const cacheKey = RedisCache.generateKey(this.cacheKeyPrefix, 'id', id);
    
    return await RedisCache.getOrSet(cacheKey, async () => {
      const entity = await this.walletRepository.findOne({
        where: { id },
        relations: ['balances']
      });
      return entity ? this.toDomain(entity) : null;
    });
  }

  async findByUserId(userId: string): Promise<SmartWallet[]> {
    const entities = await this.walletRepository.find({
      where: { userId },
      relations: ['balances']
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByAddress(address: string): Promise<SmartWallet | null> {
    const cacheKey = RedisCache.generateKey(this.cacheKeyPrefix, 'address', address);
    
    return await RedisCache.getOrSet(cacheKey, async () => {
      const entity = await this.walletRepository.findOne({
        where: { address },
        relations: ['balances']
      });
      return entity ? this.toDomain(entity) : null;
    });
  }

  async update(wallet: SmartWallet): Promise<SmartWallet> {
    await this.walletRepository.update(wallet.id, this.toEntity(wallet));
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', wallet.id));
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'address', wallet.address));
    
    return wallet;
  }

  async updateBalance(walletId: string, token: Token, balance: BigNumber): Promise<SmartWallet> {
    const balanceEntity = await this.balanceRepository.findOne({
      where: {
        walletId,
        tokenAddress: token.address,
        network: token.network
      }
    });

    if (balanceEntity) {
      await this.balanceRepository.update(balanceEntity.id, {
        balance: balance.toString()
      });
    } else {
      await this.balanceRepository.save({
        id: ethers.utils.id(Date.now().toString()),
        walletId,
        tokenAddress: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        network: token.network,
        balance: balance.toString()
      });
    }

    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', walletId));
    
    const updated = await this.findById(walletId);
    if (!updated) throw new Error('Wallet not found after update');
    return updated;
  }

  async delete(walletId: string): Promise<void> {
    const wallet = await this.findById(walletId);
    if (!wallet) return;

    await this.walletRepository.delete(walletId);
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', walletId));
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'address', wallet.address));
  }

  async findByNetwork(network: Network): Promise<SmartWallet[]> {
    const entities = await this.walletRepository.find({
      where: { network },
      relations: ['balances']
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findActive(): Promise<SmartWallet[]> {
    const entities = await this.walletRepository.find({
      where: { isActive: true },
      relations: ['balances']
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findInactive(): Promise<SmartWallet[]> {
    const entities = await this.walletRepository.find({
      where: { isActive: false },
      relations: ['balances']
    });
    return entities.map(entity => this.toDomain(entity));
  }
}
