import { Repository, DataSource } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserEntity } from '../database/entities/UserEntity';
import { KYCLevel, KYCStatus } from '../../types';
import { RedisCache } from '../cache/RedisCache';

export class UserRepository implements IUserRepository {
  private readonly repository: Repository<UserEntity>;
  private readonly cacheKeyPrefix = 'user';

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntity);
  }

  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.phone,
      entity.email,
      entity.kycStatus,
      entity.kycLevel,
      entity.whatsappOptIn,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(domain: User): Partial<UserEntity> {
    return {
      id: domain.id,
      phone: domain.phone,
      email: domain.email,
      kycStatus: domain.kycStatus,
      kycLevel: domain.kycLevel,
      whatsappOptIn: domain.whatsappOptIn
    };
  }

  async create(user: User): Promise<User> {
    const entity = await this.repository.save(this.toEntity(user));
    return this.toDomain(entity as UserEntity);
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = RedisCache.generateKey(this.cacheKeyPrefix, 'id', id);
    
    return await RedisCache.getOrSet(cacheKey, async () => {
      const entity = await this.repository.findOne({ where: { id } });
      return entity ? this.toDomain(entity) : null;
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    const cacheKey = RedisCache.generateKey(this.cacheKeyPrefix, 'phone', phone);
    
    return await RedisCache.getOrSet(cacheKey, async () => {
      const entity = await this.repository.findOne({ where: { phone } });
      return entity ? this.toDomain(entity) : null;
    });
  }

  async update(user: User): Promise<User> {
    await this.repository.update(user.id, this.toEntity(user));
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', user.id));
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'phone', user.phone));
    
    return user;
  }

  async updateKYCStatus(userId: string, status: KYCStatus): Promise<User> {
    await this.repository.update(userId, { kycStatus: status });
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', userId));
    
    const updated = await this.findById(userId);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async updateKYCLevel(userId: string, level: KYCLevel): Promise<User> {
    await this.repository.update(userId, { kycLevel: level });
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', userId));
    
    const updated = await this.findById(userId);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async delete(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;

    await this.repository.delete(userId);
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', userId));
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'phone', user.phone));
  }

  async findByKYCStatus(status: KYCStatus): Promise<User[]> {
    const entities = await this.repository.find({ where: { kycStatus: status } });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByKYCLevel(level: KYCLevel): Promise<User[]> {
    const entities = await this.repository.find({ where: { kycLevel: level } });
    return entities.map(entity => this.toDomain(entity));
  }
}
