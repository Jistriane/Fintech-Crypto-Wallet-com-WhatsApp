import { ethers } from 'ethers';
import { IWalletRepository } from '@common/domain/repositories/IWalletRepository';
import { ITransactionRepository } from '@common/domain/repositories/ITransactionRepository';
import { IUserRepository } from '@common/domain/repositories/IUserRepository';
import { SmartWallet } from '@common/domain/entities/SmartWallet';
import { Transaction } from '@common/domain/entities/Transaction';
import { Token, Network } from '@common/types';
import { BlockchainService } from '@common/infrastructure/blockchain/services/BlockchainService';
import { NotusWhatsAppService } from '../../infrastructure/whatsapp/NotusWhatsAppService';
import { RedisCache } from '@common/infrastructure/cache/RedisCache';

interface LiquidityPool {
  id: string;
  token0: Token;
  token1: Token;
  totalSupply: ethers.BigNumber;
  reserve0: ethers.BigNumber;
  reserve1: ethers.BigNumber;
  apy: number;
  network: Network;
}

interface LiquidityPosition {
  poolId: string;
  walletId: string;
  liquidity: ethers.BigNumber;
  token0Amount: ethers.BigNumber;
  token1Amount: ethers.BigNumber;
  sharePercentage: number;
}

export class LiquidityPoolService {
  private static readonly CACHE_PREFIX = 'liquidity_pool';
  private static readonly APY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly userRepository: IUserRepository,
    private readonly whatsappService: NotusWhatsAppService
  ) {
    // Iniciar monitoramento de APY
    this.startAPYMonitoring();
  }

  async addLiquidity(
    walletId: string,
    poolId: string,
    amount0Desired: ethers.BigNumber,
    amount1Desired: ethers.BigNumber,
    amount0Min: ethers.BigNumber,
    amount1Min: ethers.BigNumber
  ): Promise<Transaction> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const user = await this.userRepository.findById(wallet.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const pool = await this.getPool(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    // Verificar saldos
    if (!wallet.hasEnoughBalance(pool.token0, amount0Desired)) {
      throw new Error('Insufficient balance for token0');
    }
    if (!wallet.hasEnoughBalance(pool.token1, amount1Desired)) {
      throw new Error('Insufficient balance for token1');
    }

    // Calcular quantidades ótimas
    const { amount0, amount1 } = this.calculateOptimalAmounts(
      pool,
      amount0Desired,
      amount1Desired
    );

    // Verificar slippage
    if (amount0.lt(amount0Min) || amount1.lt(amount1Min)) {
      throw new Error('Slippage too high');
    }

    // Criar transação
    const transaction = new Transaction(
      ethers.utils.id(Date.now().toString()),
      walletId,
      'LIQUIDITY_ADD',
      'PENDING',
      wallet.address,
      this.getRouterAddress(pool.network),
      pool.token0,
      amount0,
      undefined,
      undefined,
      new Date(),
      undefined,
      new Date()
    );

    // Salvar transação
    const savedTransaction = await this.transactionRepository.create(transaction);

    // Enviar transação
    try {
      const hash = await this.executeAddLiquidity(
        wallet,
        pool,
        amount0,
        amount1,
        transaction
      );
      
      transaction.hash = hash;
      await this.transactionRepository.update(transaction);

      // Monitorar transação
      BlockchainService.monitorTransaction(wallet, transaction)
        .then(async (success) => {
          if (success) {
            // Atualizar saldos
            await Promise.all([
              this.walletRepository.updateBalance(walletId, pool.token0, wallet.getBalance(pool.token0).sub(amount0)),
              this.walletRepository.updateBalance(walletId, pool.token1, wallet.getBalance(pool.token1).sub(amount1))
            ]);

            // Atualizar posição
            const position = await this.getPosition(walletId, poolId);
            
            // Notificar via WhatsApp
            await this.whatsappService.notifyLiquidityAdded(
              user.phone,
              user.id,
              {
                pool: {
                  token0: pool.token0.symbol,
                  token1: pool.token1.symbol
                },
                amount0: ethers.utils.formatUnits(amount0, pool.token0.decimals),
                amount1: ethers.utils.formatUnits(amount1, pool.token1.decimals),
                sharePercentage: position.sharePercentage
              }
            );
          }
        });

      return savedTransaction;
    } catch (error) {
      transaction.fail(error.message);
      await this.transactionRepository.update(transaction);
      throw error;
    }
  }

  async removeLiquidity(
    walletId: string,
    poolId: string,
    liquidity: ethers.BigNumber,
    amount0Min: ethers.BigNumber,
    amount1Min: ethers.BigNumber
  ): Promise<Transaction> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const user = await this.userRepository.findById(wallet.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const pool = await this.getPool(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    const position = await this.getPosition(walletId, poolId);
    if (!position || position.liquidity.lt(liquidity)) {
      throw new Error('Insufficient liquidity');
    }

    // Criar transação
    const transaction = new Transaction(
      ethers.utils.id(Date.now().toString()),
      walletId,
      'LIQUIDITY_REMOVE',
      'PENDING',
      wallet.address,
      this.getRouterAddress(pool.network),
      pool.token0,
      liquidity,
      undefined,
      undefined,
      new Date(),
      undefined,
      new Date()
    );

    // Salvar transação
    const savedTransaction = await this.transactionRepository.create(transaction);

    // Enviar transação
    try {
      const hash = await this.executeRemoveLiquidity(
        wallet,
        pool,
        liquidity,
        amount0Min,
        amount1Min,
        transaction
      );
      
      transaction.hash = hash;
      await this.transactionRepository.update(transaction);

      // Monitorar transação
      BlockchainService.monitorTransaction(wallet, transaction)
        .then(async (success) => {
          if (success) {
            // Atualizar posição
            const newPosition = await this.getPosition(walletId, poolId);
            
            // Notificar via WhatsApp
            await this.whatsappService.notifyLiquidityRemoved(
              user.phone,
              user.id,
              {
                pool: {
                  token0: pool.token0.symbol,
                  token1: pool.token1.symbol
                },
                amount0: ethers.utils.formatUnits(amount0Min, pool.token0.decimals),
                amount1: ethers.utils.formatUnits(amount1Min, pool.token1.decimals),
                remainingShare: newPosition.sharePercentage
              }
            );
          }
        });

      return savedTransaction;
    } catch (error) {
      transaction.fail(error.message);
      await this.transactionRepository.update(transaction);
      throw error;
    }
  }

  private async getPool(poolId: string): Promise<LiquidityPool | null> {
    const cacheKey = RedisCache.generateKey(
      LiquidityPoolService.CACHE_PREFIX,
      'pool',
      poolId
    );

    return await RedisCache.getOrSet(cacheKey, async () => {
      // TODO: Implementar busca real de pool
      return {
        id: poolId,
        token0: {} as Token,
        token1: {} as Token,
        totalSupply: ethers.BigNumber.from(0),
        reserve0: ethers.BigNumber.from(0),
        reserve1: ethers.BigNumber.from(0),
        apy: 0,
        network: 'POLYGON'
      };
    });
  }

  private async getPosition(
    walletId: string,
    poolId: string
  ): Promise<LiquidityPosition> {
    const cacheKey = RedisCache.generateKey(
      LiquidityPoolService.CACHE_PREFIX,
      'position',
      walletId,
      poolId
    );

    return await RedisCache.getOrSet(cacheKey, async () => {
      // TODO: Implementar busca real de posição
      return {
        poolId,
        walletId,
        liquidity: ethers.BigNumber.from(0),
        token0Amount: ethers.BigNumber.from(0),
        token1Amount: ethers.BigNumber.from(0),
        sharePercentage: 0
      };
    });
  }

  private calculateOptimalAmounts(
    pool: LiquidityPool,
    amount0Desired: ethers.BigNumber,
    amount1Desired: ethers.BigNumber
  ): { amount0: ethers.BigNumber; amount1: ethers.BigNumber } {
    if (pool.reserve0.isZero() || pool.reserve1.isZero()) {
      return {
        amount0: amount0Desired,
        amount1: amount1Desired
      };
    }

    const amount1Optimal = amount0Desired.mul(pool.reserve1).div(pool.reserve0);
    
    if (amount1Optimal.lte(amount1Desired)) {
      return {
        amount0: amount0Desired,
        amount1: amount1Optimal
      };
    }

    const amount0Optimal = amount1Desired.mul(pool.reserve0).div(pool.reserve1);
    
    return {
      amount0: amount0Optimal,
      amount1: amount1Desired
    };
  }

  private getRouterAddress(network: Network): string {
    // TODO: Implementar mapeamento real de endereços de router
    const routers = {
      POLYGON: '0x1234...', // Endereço do QuickSwap Router
      BSC: '0x5678...' // Endereço do PancakeSwap Router
    };

    return routers[network];
  }

  private async executeAddLiquidity(
    wallet: SmartWallet,
    pool: LiquidityPool,
    amount0: ethers.BigNumber,
    amount1: ethers.BigNumber,
    transaction: Transaction
  ): Promise<string> {
    // TODO: Implementar lógica real de adição de liquidez
    return await BlockchainService.sendTransaction(wallet, transaction);
  }

  private async executeRemoveLiquidity(
    wallet: SmartWallet,
    pool: LiquidityPool,
    liquidity: ethers.BigNumber,
    amount0Min: ethers.BigNumber,
    amount1Min: ethers.BigNumber,
    transaction: Transaction
  ): Promise<string> {
    // TODO: Implementar lógica real de remoção de liquidez
    return await BlockchainService.sendTransaction(wallet, transaction);
  }

  private startAPYMonitoring(): void {
    setInterval(async () => {
      try {
        const pools = await this.getAllPools();
        
        for (const pool of pools) {
          const newAPY = await this.calculateAPY(pool);
          const oldAPY = pool.apy;

          if (Math.abs(newAPY - oldAPY) > 0.5) { // 0.5% de diferença
            // Atualizar APY no cache
            await this.updatePoolAPY(pool.id, newAPY);

            // Notificar usuários com posições
            const positions = await this.getPoolPositions(pool.id);
            
            for (const position of positions) {
              const user = await this.userRepository.findById(position.walletId);
              if (user) {
                await this.whatsappService.notifyAPYChange(
                  user.phone,
                  user.id,
                  {
                    pool: {
                      token0: pool.token0.symbol,
                      token1: pool.token1.symbol
                    },
                    oldAPY,
                    newAPY,
                    userShare: position.sharePercentage
                  }
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('Error monitoring APY:', error);
      }
    }, LiquidityPoolService.APY_UPDATE_INTERVAL);
  }

  private async getAllPools(): Promise<LiquidityPool[]> {
    // TODO: Implementar busca real de pools
    return [];
  }

  private async calculateAPY(pool: LiquidityPool): Promise<number> {
    // TODO: Implementar cálculo real de APY
    return 0;
  }

  private async updatePoolAPY(poolId: string, apy: number): Promise<void> {
    const cacheKey = RedisCache.generateKey(
      LiquidityPoolService.CACHE_PREFIX,
      'pool',
      poolId
    );

    const pool = await RedisCache.get<LiquidityPool>(cacheKey);
    if (pool) {
      pool.apy = apy;
      await RedisCache.set(cacheKey, pool);
    }
  }

  private async getPoolPositions(poolId: string): Promise<LiquidityPosition[]> {
    // TODO: Implementar busca real de posições
    return [];
  }
}
