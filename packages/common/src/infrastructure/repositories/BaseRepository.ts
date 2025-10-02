import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { ILogger } from '../../domain/interfaces/ILogger';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly logger: ILogger
  ) {}

  async findOne(id: string): Promise<T | null> {
    try {
      const options: FindOneOptions<T> = {
        where: { id } as any
      };
      return await this.repository.findOne(options);
    } catch (error) {
      this.logger.error(`Error finding entity with id ${id}`, { error });
      throw error;
    }
  }

  async find(filter: Partial<T>): Promise<T[]> {
    try {
      const options: FindManyOptions<T> = {
        where: filter as any
      };
      return await this.repository.find(options);
    } catch (error) {
      this.logger.error('Error finding entities', { error });
      throw error;
    }
  }

  async save(data: Partial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data as any);
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error('Error saving entity', { error });
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      await this.repository.update(id, data as any);
    } catch (error) {
      this.logger.error(`Error updating entity with id ${id}`, { error });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error(`Error deleting entity with id ${id}`, { error });
      throw error;
    }
  }
}
