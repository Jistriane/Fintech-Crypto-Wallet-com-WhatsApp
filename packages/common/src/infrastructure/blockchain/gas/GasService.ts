import { ethers, BigNumberish } from 'ethers';
import { ILogger } from '../../../domain/interfaces/ILogger';
import { Network } from '../../../types/enums';
import { BlockchainProvider } from '../providers/BlockchainProvider';
import { RedisCache } from '../../cache/RedisCache';
import { MainnetMonitor } from '../monitoring/MainnetMonitor';
import { AlertService } from '../../security/AlertService';

interface GasConfig {
  maxGasPrice: bigint;
  maxPriorityFee: bigint;
  baseFeeMultiplier: number;
  minGasLimit: number;
  maxGasLimit: number;
  defaultGasLimit: number;
  safetyBuffer: number; // Percentual adicional para garantir execução
}

interface GasEstimate {
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasLimit: number;
  totalCost: bigint;
  isWithinLimits: boolean;
}

export class GasService {
  private gasConfigs: Map<Network, GasConfig>;
  private readonly GAS_CACHE_KEY = 'gas_estimates';
  private readonly GAS_CACHE_TTL = 60; // 1 minuto
  private readonly GAS_HISTORY_CACHE_KEY = 'gas_history';
  private readonly GAS_HISTORY_TTL = 86400; // 24 horas
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly mainnetMonitor: MainnetMonitor,
    private readonly alertService: AlertService,
    private readonly cache: RedisCache,
    private readonly logger: ILogger
  ) {
    this.gasConfigs = new Map();
    this.initializeGasConfigs();
  }

  private initializeGasConfigs() {
    // Polygon Mainnet
    this.gasConfigs.set(Network.POLYGON, {
      maxGasPrice: ethers.parseUnits('300', 'gwei'),
      maxPriorityFee: ethers.parseUnits('50', 'gwei'),
      baseFeeMultiplier: 1.5,
      minGasLimit: 21000,
      maxGasLimit: 2000000,
      defaultGasLimit: 100000,
      safetyBuffer: 20 // 20%
    });

    // BSC Mainnet
    this.gasConfigs.set(Network.BSC, {
      maxGasPrice: ethers.parseUnits('15', 'gwei'),
      maxPriorityFee: ethers.parseUnits('3', 'gwei'),
      baseFeeMultiplier: 1.3,
      minGasLimit: 21000,
      maxGasLimit: 1000000,
      defaultGasLimit: 100000,
      safetyBuffer: 15 // 15%
    });
  }

  async estimateGas(
    network: Network,
    txRequest: {
      to: string;
      from: string;
      value?: BigNumberish;
      data?: string;
    }
  ): Promise<GasEstimate> {
    try {
      const config = this.gasConfigs.get(network);
      if (!config) {
        throw new Error(`Network ${network} not supported`);
      }

      // 1. Tenta usar cache primeiro
      const cachedEstimate = await this.getGasEstimateFromCache(network);
      if (cachedEstimate) {
        return this.validateAndAdjustEstimate(network, cachedEstimate);
      }

      // 2. Obtém estimativas atuais da rede
      const provider = BlockchainProvider.getProvider(network);
      const feeData = await provider.getFeeData();
      
      // 3. Estima limite de gás
      let gasLimit = config.defaultGasLimit;
      try {
        gasLimit = Number(await provider.estimateGas(txRequest));
        gasLimit = Math.min(
          Math.max(gasLimit * (1 + config.safetyBuffer/100), config.minGasLimit),
          config.maxGasLimit
        );
      } catch (error) {
        this.logger.warn(`Failed to estimate gas limit for ${network}, using default`, error as Error);
      }

      // 4. Calcula preços de gás
      let gasPrice = feeData.gasPrice ? BigInt(feeData.gasPrice.toString()) : BigInt(0);
      let maxFeePerGas = feeData.maxFeePerGas ? BigInt(feeData.maxFeePerGas.toString()) : undefined;
      let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? 
        BigInt(feeData.maxPriorityFeePerGas.toString()) : undefined;

      // 5. Ajusta baseado na congestionamento da rede
      const congestion = await this.mainnetMonitor.getNetworkCongestion(network);
      const congestionMultiplier = this.getCongestionMultiplier(congestion);
      
      gasPrice = gasPrice * BigInt(Math.floor(congestionMultiplier * 100)) / BigInt(100);
      if (maxFeePerGas) {
        maxFeePerGas = maxFeePerGas * BigInt(Math.floor(congestionMultiplier * 100)) / BigInt(100);
      }

      // 6. Aplica limites
      gasPrice = this.applyGasLimits(network, gasPrice);
      if (maxFeePerGas) {
        maxFeePerGas = this.applyGasLimits(network, maxFeePerGas);
      }
      if (maxPriorityFeePerGas) {
        maxPriorityFeePerGas = BigInt(Math.min(
          Number(maxPriorityFeePerGas),
          Number(config.maxPriorityFee)
        ));
      }

      // 7. Calcula custo total estimado
      const totalCost = gasPrice * BigInt(gasLimit);

      const estimate: GasEstimate = {
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit,
        totalCost,
        isWithinLimits: gasPrice <= config.maxGasPrice
      };

      // 8. Salva no cache
      await this.cacheGasEstimate(network, estimate);

      // 9. Salva no histórico
      await this.saveGasHistory(network, estimate);

      return estimate;

    } catch (error) {
      this.logger.error(`Error estimating gas for ${network}`, error as Error);
      throw error;
    }
  }

  private async getGasEstimateFromCache(network: Network): Promise<GasEstimate | null> {
    try {
      return await this.cache.get<GasEstimate>(`${this.GAS_CACHE_KEY}_${network}`);
    } catch (error) {
      this.logger.error(`Error getting gas estimate from cache for ${network}`, error as Error);
      return null;
    }
  }

  private async cacheGasEstimate(network: Network, estimate: GasEstimate): Promise<void> {
    try {
      await this.cache.set(
        `${this.GAS_CACHE_KEY}_${network}`,
        estimate,
        this.GAS_CACHE_TTL
      );
    } catch (error) {
      this.logger.error(`Error caching gas estimate for ${network}`, error as Error);
    }
  }

  private async saveGasHistory(network: Network, estimate: GasEstimate): Promise<void> {
    try {
      const history = await this.cache.get<GasEstimate[]>(
        `${this.GAS_HISTORY_CACHE_KEY}_${network}`
      ) || [];

      history.push({
        ...estimate,
        timestamp: new Date().toISOString()
      } as any);

      // Mantém apenas as últimas 1000 estimativas
      if (history.length > 1000) {
        history.shift();
      }

      await this.cache.set(
        `${this.GAS_HISTORY_CACHE_KEY}_${network}`,
        history,
        this.GAS_HISTORY_TTL
      );
    } catch (error) {
      this.logger.error(`Error saving gas history for ${network}`, error as Error);
    }
  }

  private getCongestionMultiplier(congestion: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (congestion) {
      case 'LOW': return 1.0;
      case 'MEDIUM': return 1.2;
      case 'HIGH': return 1.5;
      default: return 1.0;
    }
  }

  private applyGasLimits(network: Network, gasPrice: bigint): bigint {
    const config = this.gasConfigs.get(network)!;
    return BigInt(Math.min(Number(gasPrice), Number(config.maxGasPrice)));
  }

  private validateAndAdjustEstimate(network: Network, estimate: GasEstimate): GasEstimate {
    const config = this.gasConfigs.get(network)!;

    // Ajusta gasLimit
    estimate.gasLimit = Math.min(
      Math.max(estimate.gasLimit, config.minGasLimit),
      config.maxGasLimit
    );

    // Ajusta gasPrice
    estimate.gasPrice = this.applyGasLimits(network, estimate.gasPrice);

    // Ajusta maxFeePerGas se presente
    if (estimate.maxFeePerGas) {
      estimate.maxFeePerGas = this.applyGasLimits(network, estimate.maxFeePerGas);
    }

    // Ajusta maxPriorityFeePerGas se presente
    if (estimate.maxPriorityFeePerGas) {
      estimate.maxPriorityFeePerGas = BigInt(Math.min(
        Number(estimate.maxPriorityFeePerGas),
        Number(config.maxPriorityFee)
      ));
    }

    // Recalcula custo total
    estimate.totalCost = estimate.gasPrice * BigInt(estimate.gasLimit);

    // Verifica se está dentro dos limites
    estimate.isWithinLimits = estimate.gasPrice <= config.maxGasPrice;

    return estimate;
  }

  async getGasHistory(
    network: Network,
    period: '1h' | '24h' | '7d' = '24h'
  ): Promise<{
    average: bigint;
    median: bigint;
    min: bigint;
    max: bigint;
    history: Array<{
      gasPrice: bigint;
      timestamp: string;
    }>;
  }> {
    try {
      const history = await this.cache.get<Array<GasEstimate & { timestamp: string }>>(
        `${this.GAS_HISTORY_CACHE_KEY}_${network}`
      ) || [];

      const now = new Date();
      const periodMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      }[period];

      const filteredHistory = history.filter(entry => {
        const entryTime = new Date(entry.timestamp).getTime();
        return now.getTime() - entryTime <= periodMs;
      });

      if (filteredHistory.length === 0) {
        return {
          average: BigInt(0),
          median: BigInt(0),
          min: BigInt(0),
          max: BigInt(0),
          history: []
        };
      }

      const gasPrices = filteredHistory.map(entry => entry.gasPrice);
      const sortedPrices = [...gasPrices].sort((a, b) => 
        Number(a - b)
      );

      return {
        average: this.calculateAverage(gasPrices),
        median: sortedPrices[Math.floor(sortedPrices.length / 2)],
        min: sortedPrices[0],
        max: sortedPrices[sortedPrices.length - 1],
        history: filteredHistory.map(entry => ({
          gasPrice: entry.gasPrice,
          timestamp: entry.timestamp
        }))
      };

    } catch (error) {
      this.logger.error(`Error getting gas history for ${network}`, error as Error);
      throw error;
    }
  }

  private calculateAverage(values: bigint[]): bigint {
    if (values.length === 0) return BigInt(0);
    const sum = values.reduce((a, b) => a + b, BigInt(0));
    return sum / BigInt(values.length);
  }

  async updateGasConfig(network: Network, config: Partial<GasConfig>): Promise<void> {
    try {
      const currentConfig = this.gasConfigs.get(network);
      if (!currentConfig) {
        throw new Error(`Network ${network} not supported`);
      }

      this.gasConfigs.set(network, {
        ...currentConfig,
        ...config
      });

      this.logger.info(`Gas config updated for ${network}`, config);
    } catch (error) {
      this.logger.error(`Error updating gas config for ${network}`, error as Error);
      throw error;
    }
  }

  async getGasConfig(network: Network): Promise<GasConfig | undefined> {
    return this.gasConfigs.get(network);
  }
}
