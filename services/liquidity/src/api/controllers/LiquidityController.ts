import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { LiquidityPoolService } from '../../domain/LiquidityPoolService';
import { rateLimitMiddleware } from '@common/infrastructure/middleware/rateLimitMiddleware';
import { AuthenticatedRequest } from '@common/infrastructure/middleware/rateLimitMiddleware';
import { Token } from '@common/types';

export class LiquidityController {
  constructor(private readonly liquidityService: LiquidityPoolService) {}

  async addLiquidity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        walletId,
        poolId,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        token0,
        token1
      } = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const transaction = await this.liquidityService.addLiquidity(
        walletId,
        poolId,
        ethers.utils.parseUnits(amount0Desired, token0.decimals),
        ethers.utils.parseUnits(amount1Desired, token1.decimals),
        ethers.utils.parseUnits(amount0Min, token0.decimals),
        ethers.utils.parseUnits(amount1Min, token1.decimals)
      );

      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to add liquidity',
        message: error.message
      });
    }
  }

  async removeLiquidity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        walletId,
        poolId,
        liquidity,
        amount0Min,
        amount1Min,
        token0,
        token1
      } = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const transaction = await this.liquidityService.removeLiquidity(
        walletId,
        poolId,
        ethers.utils.parseUnits(liquidity, 18), // LP tokens sempre têm 18 decimais
        ethers.utils.parseUnits(amount0Min, token0.decimals),
        ethers.utils.parseUnits(amount1Min, token1.decimals)
      );

      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to remove liquidity',
        message: error.message
      });
    }
  }

  async getPool(req: Request, res: Response): Promise<void> {
    try {
      const { poolId } = req.params;
      const pool = await this.liquidityService.getPool(poolId);

      if (!pool) {
        res.status(404).json({ error: 'Pool not found' });
        return;
      }

      res.status(200).json({
        ...pool,
        totalSupply: ethers.utils.formatUnits(pool.totalSupply, 18),
        reserve0: ethers.utils.formatUnits(pool.reserve0, pool.token0.decimals),
        reserve1: ethers.utils.formatUnits(pool.reserve1, pool.token1.decimals)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get pool',
        message: error.message
      });
    }
  }

  async getPosition(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId, poolId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const position = await this.liquidityService.getPosition(walletId, poolId);
      const pool = await this.liquidityService.getPool(poolId);

      if (!position || !pool) {
        res.status(404).json({ error: 'Position not found' });
        return;
      }

      res.status(200).json({
        ...position,
        liquidity: ethers.utils.formatUnits(position.liquidity, 18),
        token0Amount: ethers.utils.formatUnits(position.token0Amount, pool.token0.decimals),
        token1Amount: ethers.utils.formatUnits(position.token1Amount, pool.token1.decimals)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get position',
        message: error.message
      });
    }
  }

  async getAllPools(req: Request, res: Response): Promise<void> {
    try {
      const pools = await this.liquidityService.getAllPools();

      res.status(200).json(
        pools.map(pool => ({
          ...pool,
          totalSupply: ethers.utils.formatUnits(pool.totalSupply, 18),
          reserve0: ethers.utils.formatUnits(pool.reserve0, pool.token0.decimals),
          reserve1: ethers.utils.formatUnits(pool.reserve1, pool.token1.decimals)
        }))
      );
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get pools',
        message: error.message
      });
    }
  }

  async getPoolPositions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const positions = await this.liquidityService.getPoolPositions(walletId);
      const pools = await Promise.all(
        positions.map(pos => this.liquidityService.getPool(pos.poolId))
      );

      const formattedPositions = positions.map((position, index) => {
        const pool = pools[index];
        if (!pool) return null;

        return {
          ...position,
          liquidity: ethers.utils.formatUnits(position.liquidity, 18),
          token0Amount: ethers.utils.formatUnits(position.token0Amount, pool.token0.decimals),
          token1Amount: ethers.utils.formatUnits(position.token1Amount, pool.token1.decimals),
          pool: {
            token0: pool.token0,
            token1: pool.token1,
            apy: pool.apy
          }
        };
      }).filter(Boolean);

      res.status(200).json(formattedPositions);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get positions',
        message: error.message
      });
    }
  }

  setupRoutes(app: any): void {
    const router = app.Router();

    // Aplicar rate limiting
    router.use(rateLimitMiddleware);

    // Rotas de pool
    router.get('/pools', this.getAllPools.bind(this));
    router.get('/pools/:poolId', this.getPool.bind(this));
    
    // Rotas de posição
    router.get('/wallets/:walletId/positions', this.getPoolPositions.bind(this));
    router.get('/wallets/:walletId/pools/:poolId/position', this.getPosition.bind(this));
    
    // Rotas de operações
    router.post('/liquidity/add', this.addLiquidity.bind(this));
    router.post('/liquidity/remove', this.removeLiquidity.bind(this));

    app.use('/api/v1/liquidity', router);
  }
}
