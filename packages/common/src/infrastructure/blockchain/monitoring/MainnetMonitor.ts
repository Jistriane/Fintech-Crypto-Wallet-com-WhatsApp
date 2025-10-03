import { ethers, JsonRpcProvider, TransactionReceipt, TransactionResponse } from 'ethers';
import { ILogger } from '../../../domain/interfaces/ILogger';
import { Network, TransactionStatus } from '../../../types/enums';
import { BlockchainProvider } from '../providers/BlockchainProvider';
import { ICacheService } from '../../../domain/interfaces/ICacheService';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IWalletRepository } from '../../../domain/repositories/IWalletRepository';

interface NetworkState {
  lastBlockNumber: number;
  gasPrice: bigint;
  safeGasPrice: bigint;
  proposeGasPrice: bigint;
  fastGasPrice: bigint;
  baseFee?: bigint;
  pendingTransactions: number;
  networkCongestion: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface AlertConfig {
  gasPriceThreshold: bigint;
  blockDelayThreshold: number;
  pendingTxThreshold: number;
  largeTransactionThreshold: bigint;
}

export class MainnetMonitor {
  private networkStates: Map<Network, NetworkState>;
  private alertConfigs: Map<Network, AlertConfig>;
  private providers: Map<Network, JsonRpcProvider>;
  private blockSubscriptions: Map<Network, ethers.Listener>;
  private pendingTxSubscriptions: Map<Network, ethers.Listener>;
  private readonly ALERT_CACHE_KEY = 'mainnet_monitor_alerts';
  private readonly NETWORK_STATE_CACHE_KEY = 'mainnet_monitor_state';
  private readonly UPDATE_INTERVAL = 15000; // 15 segundos
  private readonly ALERT_TTL = 3600; // 1 hora
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly cache: ICacheService,
    private readonly logger: ILogger
  ) {
    this.networkStates = new Map();
    this.alertConfigs = new Map();
    this.providers = new Map();
    this.blockSubscriptions = new Map();
    this.pendingTxSubscriptions = new Map();

    // Configurações de alerta por rede
    this.initializeAlertConfigs();
  }

  private initializeAlertConfigs() {
    // Polygon Mainnet
    this.alertConfigs.set(Network.POLYGON, {
      gasPriceThreshold: ethers.parseUnits('100', 'gwei'),
      blockDelayThreshold: 5, // blocos
      pendingTxThreshold: 5000,
      largeTransactionThreshold: ethers.parseEther('10000')
    });

    // BSC Mainnet
    this.alertConfigs.set(Network.BSC, {
      gasPriceThreshold: ethers.parseUnits('10', 'gwei'),
      blockDelayThreshold: 10,
      pendingTxThreshold: 10000,
      largeTransactionThreshold: ethers.parseEther('50')
    });
  }

  async start() {
    this.logger.info('Iniciando monitoramento de mainnet');

    // Inicializa providers
    for (const network of [Network.POLYGON, Network.BSC]) {
      const provider = BlockchainProvider.getProvider(network);
      this.providers.set(network, provider);

      // Restaura estado da rede do cache
      const cachedState = await this.cache.get<NetworkState>(`${this.NETWORK_STATE_CACHE_KEY}_${network}`);
      if (cachedState) {
        this.networkStates.set(network, cachedState);
      }

      // Inicia monitoramento de blocos
      this.subscribeToBlocks(network);
      
      // Inicia monitoramento de transações pendentes
      this.subscribeToPendingTransactions(network);
    }

    // Inicia loop de atualização
    this.updateInterval = setInterval(() => this.updateNetworkStates(), this.UPDATE_INTERVAL);
  }

  async stop() {
    this.logger.info('Parando monitoramento de mainnet');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Remove todas as subscrições
    for (const [network, subscription] of this.blockSubscriptions) {
      const provider = this.providers.get(network);
      if (provider) {
        provider.off('block', subscription);
      }
    }

    for (const [network, subscription] of this.pendingTxSubscriptions) {
      const provider = this.providers.get(network);
      if (provider) {
        provider.off('pending', subscription);
      }
    }

    this.blockSubscriptions.clear();
    this.pendingTxSubscriptions.clear();
  }

  private subscribeToBlocks(network: Network) {
    const provider = this.providers.get(network);
    if (!provider) return;

    const blockHandler = async (blockNumber: number) => {
      try {
        const block = await provider.getBlock(blockNumber);
        if (!block) return;

        const state = this.networkStates.get(network) || this.createInitialNetworkState();
        state.lastBlockNumber = blockNumber;
        state.baseFee = block.baseFeePerGas ? BigInt(block.baseFeePerGas.toString()) : undefined;

        // Atualiza estado
        this.networkStates.set(network, state);

        // Salva no cache
        await this.cache.set(
          `${this.NETWORK_STATE_CACHE_KEY}_${network}`,
          state,
          this.ALERT_TTL
        );

        // Verifica atrasos de bloco
        const timestamp = block.timestamp;
        const now = Math.floor(Date.now() / 1000);
        const delay = now - timestamp;
        
        if (delay > this.alertConfigs.get(network)?.blockDelayThreshold!) {
          await this.createAlert(network, 'BLOCK_DELAY', {
            blockNumber,
            delay,
            timestamp
          });
        }

        // Monitora transações no bloco
        await this.monitorBlockTransactions(network, block);

      } catch (error) {
        this.logger.error(`Erro ao processar bloco em ${network}`, error as Error, { network });
      }
    };

    provider.on('block', blockHandler);
    this.blockSubscriptions.set(network, blockHandler);
  }

  private subscribeToPendingTransactions(network: Network) {
    const provider = this.providers.get(network);
    if (!provider) return;

    const txHandler = async (txHash: string) => {
      try {
        const tx = await provider.getTransaction(txHash);
        if (!tx) return;

        // Monitora transações grandes
        const value = BigInt(tx.value.toString());
        const threshold = this.alertConfigs.get(network)?.largeTransactionThreshold!;
        
        if (value >= threshold) {
          await this.createAlert(network, 'LARGE_TRANSACTION', {
            txHash,
            value: value.toString(),
            from: tx.from,
            to: tx.to
          });
        }

        // Atualiza contagem de transações pendentes
        const state = this.networkStates.get(network) || this.createInitialNetworkState();
        state.pendingTransactions++;
        this.networkStates.set(network, state);

      } catch (error) {
        this.logger.error(`Erro ao processar transação pendente em ${network}`, error as Error, { network });
      }
    };

    provider.on('pending', txHandler);
    this.pendingTxSubscriptions.set(network, txHandler);
  }

  private async monitorBlockTransactions(network: Network, block: any) {
    const provider = this.providers.get(network);
    if (!provider) return;

    try {
      // Monitora transações de carteiras do sistema
      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (!tx) continue;

        // Verifica se é uma transação de uma carteira nossa
        const fromWallet = await this.walletRepository.findByAddress(tx.from);
        const toWallet = tx.to ? await this.walletRepository.findByAddress(tx.to) : null;

        if (fromWallet || toWallet) {
          await this.processSystemWalletTransaction(network, tx, fromWallet?.id, toWallet?.id);
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao monitorar transações do bloco em ${network}`, error as Error, { network });
    }
  }

  private async processSystemWalletTransaction(
    network: Network,
    tx: TransactionResponse,
    fromWalletId?: string,
    toWalletId?: string
  ) {
    try {
      const receipt = await tx.wait();
      if (!receipt) return;

      const status = receipt.status === 1 ? TransactionStatus.COMPLETED : TransactionStatus.FAILED;

      // Atualiza transação no banco de dados
      if (fromWalletId) {
        await this.transactionRepository.update(tx.hash, {
          status,
          error: status === TransactionStatus.FAILED ? 'Transaction failed on mainnet' : undefined
        });
      }

      // Atualiza saldos
      if (fromWalletId) {
        const balance = await this.providers.get(network)?.getBalance(tx.from);
        if (balance) {
          await this.walletRepository.updateBalance(fromWalletId, 'native', balance.toString());
        }
      }

      if (toWalletId && tx.to) {
        const balance = await this.providers.get(network)?.getBalance(tx.to);
        if (balance) {
          await this.walletRepository.updateBalance(toWalletId, 'native', balance.toString());
        }
      }

      // Cria alerta se a transação falhou
      if (status === TransactionStatus.FAILED) {
        await this.createAlert(network, 'TRANSACTION_FAILED', {
          txHash: tx.hash,
          fromWallet: fromWalletId,
          toWallet: toWalletId,
          error: 'Transaction failed on mainnet'
        });
      }

    } catch (error) {
      this.logger.error(`Erro ao processar transação do sistema em ${network}`, error as Error, { network });
    }
  }

  private async updateNetworkStates() {
    for (const [network, provider] of this.providers) {
      try {
        const state = this.networkStates.get(network) || this.createInitialNetworkState();
        
        // Atualiza preços de gás
        const feeData = await provider.getFeeData();
        if (feeData.gasPrice) {
          state.gasPrice = BigInt(feeData.gasPrice.toString());
        }
        
        // Calcula congestionamento da rede
        const pendingTxThreshold = this.alertConfigs.get(network)?.pendingTxThreshold!;
        if (state.pendingTransactions > pendingTxThreshold * 1.5) {
          state.networkCongestion = 'HIGH';
        } else if (state.pendingTransactions > pendingTxThreshold) {
          state.networkCongestion = 'MEDIUM';
        } else {
          state.networkCongestion = 'LOW';
        }

        // Verifica preço do gás
        const gasPriceThreshold = this.alertConfigs.get(network)?.gasPriceThreshold!;
        if (state.gasPrice >= gasPriceThreshold) {
          await this.createAlert(network, 'HIGH_GAS_PRICE', {
            gasPrice: state.gasPrice.toString(),
            threshold: gasPriceThreshold.toString()
          });
        }

        // Atualiza estado
        this.networkStates.set(network, state);
        
        // Salva no cache
        await this.cache.set(
          `${this.NETWORK_STATE_CACHE_KEY}_${network}`,
          state,
          this.ALERT_TTL
        );

      } catch (error) {
        this.logger.error(`Erro ao atualizar estado da rede ${network}`, error as Error, { network });
      }
    }
  }

  private async createAlert(network: Network, type: string, data: any) {
    const alert = {
      network,
      type,
      data,
      timestamp: new Date().toISOString()
    };

    try {
      // Salva alerta no cache
      const alerts = await this.cache.get<any[]>(this.ALERT_CACHE_KEY) || [];
      alerts.push(alert);
      await this.cache.set(this.ALERT_CACHE_KEY, alerts, this.ALERT_TTL);

      // Log do alerta
      this.logger.warn(`Alerta de mainnet: ${type} em ${network}`, data);

    } catch (error) {
      this.logger.error(`Erro ao criar alerta de mainnet`, error as Error, { network, type });
    }
  }

  private createInitialNetworkState(): NetworkState {
    return {
      lastBlockNumber: 0,
      gasPrice: BigInt(0),
      safeGasPrice: BigInt(0),
      proposeGasPrice: BigInt(0),
      fastGasPrice: BigInt(0),
      pendingTransactions: 0,
      networkCongestion: 'LOW'
    };
  }

  // Métodos públicos para consulta de estado

  async getNetworkState(network: Network): Promise<NetworkState | null> {
    return this.networkStates.get(network) || null;
  }

  async getAlerts(limit: number = 100): Promise<any[]> {
    const alerts = await this.cache.get<any[]>(this.ALERT_CACHE_KEY) || [];
    return alerts.slice(-limit);
  }

  async getNetworkCongestion(network: Network): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
    const state = this.networkStates.get(network);
    return state?.networkCongestion || 'LOW';
  }

  async getRecommendedGasPrice(network: Network): Promise<bigint> {
    const state = this.networkStates.get(network);
    return state?.proposeGasPrice || BigInt(0);
  }
}