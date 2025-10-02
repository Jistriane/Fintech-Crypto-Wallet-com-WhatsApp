import { JsonRpcProvider, Contract, formatUnits, parseUnits, TransactionRequest, TransactionReceipt, Network as EthersNetwork } from 'ethers';
import { Network } from '../../../types';
import { NETWORK_LIMITS } from '../../../constants/kyc';

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  nativeToken: string;
  requiredConfirmations: number;
  minGasFee: string;
  maxSingleTransaction: string;
}

export class BlockchainProvider {
  private static providers: Record<Network, JsonRpcProvider> = {} as any;
  private static configs: Record<Network, BlockchainConfig> = {
    POLYGON: {
      rpcUrl: process.env.POLYGON_RPC_URL!,
      chainId: 137,
      nativeToken: 'MATIC',
      requiredConfirmations: NETWORK_LIMITS.POLYGON.requiredConfirmations,
      minGasFee: NETWORK_LIMITS.POLYGON.minGasFee,
      maxSingleTransaction: NETWORK_LIMITS.POLYGON.maxSingleTransaction
    },
    BSC: {
      rpcUrl: process.env.BSC_RPC_URL!,
      chainId: 56,
      nativeToken: 'BNB',
      requiredConfirmations: NETWORK_LIMITS.BSC.requiredConfirmations,
      minGasFee: NETWORK_LIMITS.BSC.minGasFee,
      maxSingleTransaction: NETWORK_LIMITS.BSC.maxSingleTransaction
    }
  };

  static getProvider(network: Network): JsonRpcProvider {
    if (!BlockchainProvider.providers[network]) {
      const config = BlockchainProvider.configs[network];
      BlockchainProvider.providers[network] = new JsonRpcProvider(
        config.rpcUrl,
        {
          name: network,
          chainId: config.chainId
        } as EthersNetwork
      );
    }

    return BlockchainProvider.providers[network];
  }

  static getConfig(network: Network): BlockchainConfig {
    return BlockchainProvider.configs[network];
  }

  static async getGasPrice(network: Network): Promise<bigint> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.getFeeData().then(fees => fees.gasPrice || 0n);
  }

  static async estimateGas(
    network: Network,
    transaction: TransactionRequest
  ): Promise<bigint> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.estimateGas(transaction);
  }

  static async getTransactionReceipt(
    network: Network,
    hash: string
  ): Promise<TransactionReceipt | null> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.getTransactionReceipt(hash);
  }

  static async waitForTransaction(
    network: Network,
    hash: string
  ): Promise<TransactionReceipt> {
    const provider = BlockchainProvider.getProvider(network);
    const config = BlockchainProvider.configs[network];
    
    return await provider.waitForTransaction(
      hash,
      config.requiredConfirmations
    );
  }

  static async getBalance(
    network: Network,
    address: string
  ): Promise<bigint> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.getBalance(address);
  }

  static async getTokenBalance(
    network: Network,
    tokenAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    const provider = BlockchainProvider.getProvider(network);
    const tokenContract = new Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    return await tokenContract.balanceOf(walletAddress);
  }

  static validateTransaction(
    network: Network,
    value: bigint
  ): boolean {
    const config = BlockchainProvider.configs[network];
    const maxValue = parseUnits(config.maxSingleTransaction, 18);
    
    return value <= maxValue;
  }

  static async isContractAddress(
    network: Network,
    address: string
  ): Promise<boolean> {
    const provider = BlockchainProvider.getProvider(network);
    const code = await provider.getCode(address);
    return code !== '0x';
  }
}