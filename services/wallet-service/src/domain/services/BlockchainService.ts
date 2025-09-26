import { ethers } from 'ethers';
import { WalletNetwork } from '../entities/Wallet';
import { ILogger } from '@fintech/common';
import { Redis } from 'ioredis';

interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTime: number;
  requiredConfirmations: number;
}

interface TokenConfig {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export class BlockchainService {
  private providers: Map<WalletNetwork, ethers.JsonRpcProvider>;
  private networkConfigs: Map<WalletNetwork, NetworkConfig>;
  private tokenConfigs: Map<WalletNetwork, Map<string, TokenConfig>>;

  constructor(
    private readonly logger: ILogger,
    private readonly redis: Redis,
    configs: {
      [key in WalletNetwork]: NetworkConfig;
    }
  ) {
    this.providers = new Map();
    this.networkConfigs = new Map();
    this.tokenConfigs = new Map();

    // Inicializa providers e configs
    Object.entries(configs).forEach(([network, config]) => {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      this.providers.set(network as WalletNetwork, provider);
      this.networkConfigs.set(network as WalletNetwork, config);
      this.tokenConfigs.set(network as WalletNetwork, new Map());
    });
  }

  async getProvider(network: WalletNetwork): Promise<ethers.JsonRpcProvider> {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network ${network}`);
    }
    return provider;
  }

  async getNetworkConfig(network: WalletNetwork): Promise<NetworkConfig> {
    const config = this.networkConfigs.get(network);
    if (!config) {
      throw new Error(`Config not found for network ${network}`);
    }
    return config;
  }

  async createWallet(): Promise<{ address: string; privateKey: string }> {
    try {
      const wallet = ethers.Wallet.createRandom();
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      };
    } catch (error) {
      this.logger.error('Error creating wallet', { error });
      throw error;
    }
  }

  async getNativeBalance(network: WalletNetwork, address: string): Promise<string> {
    try {
      const provider = await this.getProvider(network);
      const balance = await provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      this.logger.error('Error getting native balance', { error, network, address });
      throw error;
    }
  }

  async getTokenBalance(
    network: WalletNetwork,
    tokenAddress: string,
    walletAddress: string
  ): Promise<string> {
    try {
      const provider = await this.getProvider(network);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      const balance = await tokenContract.balanceOf(walletAddress);
      return balance.toString();
    } catch (error) {
      this.logger.error('Error getting token balance', { error, network, tokenAddress, walletAddress });
      throw error;
    }
  }

  async getTokenInfo(
    network: WalletNetwork,
    tokenAddress: string
  ): Promise<TokenConfig> {
    try {
      // Verifica cache
      const cachedInfo = await this.redis.get(`token:${network}:${tokenAddress}`);
      if (cachedInfo) {
        return JSON.parse(cachedInfo);
      }

      // Busca da blockchain
      const provider = await this.getProvider(network);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function symbol() view returns (string)',
          'function name() view returns (string)',
          'function decimals() view returns (uint8)'
        ],
        provider
      );

      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals()
      ]);

      const tokenInfo = { address: tokenAddress, symbol, name, decimals };

      // Salva no cache
      await this.redis.set(
        `token:${network}:${tokenAddress}`,
        JSON.stringify(tokenInfo),
        'EX',
        86400 // 24 horas
      );

      // Salva na memória
      const networkTokens = this.tokenConfigs.get(network) || new Map();
      networkTokens.set(tokenAddress, tokenInfo);
      this.tokenConfigs.set(network, networkTokens);

      return tokenInfo;
    } catch (error) {
      this.logger.error('Error getting token info', { error, network, tokenAddress });
      throw error;
    }
  }

  async estimateGas(
    network: WalletNetwork,
    transaction: ethers.TransactionRequest
  ): Promise<string> {
    try {
      const provider = await this.getProvider(network);
      const gasEstimate = await provider.estimateGas(transaction);
      return gasEstimate.toString();
    } catch (error) {
      this.logger.error('Error estimating gas', { error, network, transaction });
      throw error;
    }
  }

  async getGasPrice(network: WalletNetwork): Promise<{
    slow: string;
    standard: string;
    fast: string;
  }> {
    try {
      const provider = await this.getProvider(network);
      const feeData = await provider.getFeeData();

      return {
        slow: feeData.gasPrice!.toString(),
        standard: (feeData.gasPrice! * BigInt(12) / BigInt(10)).toString(),
        fast: (feeData.gasPrice! * BigInt(15) / BigInt(10)).toString()
      };
    } catch (error) {
      this.logger.error('Error getting gas price', { error, network });
      throw error;
    }
  }

  async sendTransaction(
    network: WalletNetwork,
    signedTransaction: string
  ): Promise<string> {
    try {
      const provider = await this.getProvider(network);
      const tx = await provider.broadcastTransaction(signedTransaction);
      return tx.hash;
    } catch (error) {
      this.logger.error('Error sending transaction', { error, network });
      throw error;
    }
  }

  async getTransactionReceipt(
    network: WalletNetwork,
    txHash: string
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = await this.getProvider(network);
      return await provider.getTransactionReceipt(txHash);
    } catch (error) {
      this.logger.error('Error getting transaction receipt', { error, network, txHash });
      throw error;
    }
  }

  async getTransactionCount(
    network: WalletNetwork,
    address: string
  ): Promise<number> {
    try {
      const provider = await this.getProvider(network);
      return await provider.getTransactionCount(address);
    } catch (error) {
      this.logger.error('Error getting transaction count', { error, network, address });
      throw error;
    }
  }

  async waitForTransaction(
    network: WalletNetwork,
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt> {
    try {
      const provider = await this.getProvider(network);
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      this.logger.error('Error waiting for transaction', { error, network, txHash });
      throw error;
    }
  }

  async isContract(network: WalletNetwork, address: string): Promise<boolean> {
    try {
      const provider = await this.getProvider(network);
      const code = await provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      this.logger.error('Error checking if address is contract', { error, network, address });
      throw error;
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }

  async getRequiredConfirmations(network: WalletNetwork): Promise<number> {
    const config = await this.getNetworkConfig(network);
    return config.requiredConfirmations;
  }

  async getBlockTime(network: WalletNetwork): Promise<number> {
    const config = await this.getNetworkConfig(network);
    return config.blockTime;
  }

  async getChainId(network: WalletNetwork): Promise<number> {
    const config = await this.getNetworkConfig(network);
    return config.chainId;
  }

  async getNativeCurrency(network: WalletNetwork): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    const config = await this.getNetworkConfig(network);
    return config.nativeCurrency;
  }
}
