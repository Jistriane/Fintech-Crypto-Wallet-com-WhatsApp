import { ethers } from 'ethers';
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
  private static providers: Record<Network, ethers.providers.JsonRpcProvider> = {} as any;
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

  static getProvider(network: Network): ethers.providers.JsonRpcProvider {
    if (!BlockchainProvider.providers[network]) {
      const config = BlockchainProvider.configs[network];
      BlockchainProvider.providers[network] = new ethers.providers.JsonRpcProvider(
        config.rpcUrl,
        {
          name: network,
          chainId: config.chainId
        }
      );
    }

    return BlockchainProvider.providers[network];
  }

  static getConfig(network: Network): BlockchainConfig {
    return BlockchainProvider.configs[network];
  }

  static async getGasPrice(network: Network): Promise<ethers.BigNumber> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.getGasPrice();
  }

  static async estimateGas(
    network: Network,
    transaction: ethers.providers.TransactionRequest
  ): Promise<ethers.BigNumber> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.estimateGas(transaction);
  }

  static async getTransactionReceipt(
    network: Network,
    hash: string
  ): Promise<ethers.providers.TransactionReceipt | null> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.getTransactionReceipt(hash);
  }

  static async waitForTransaction(
    network: Network,
    hash: string
  ): Promise<ethers.providers.TransactionReceipt> {
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
  ): Promise<ethers.BigNumber> {
    const provider = BlockchainProvider.getProvider(network);
    return await provider.getBalance(address);
  }

  static async getTokenBalance(
    network: Network,
    tokenAddress: string,
    walletAddress: string
  ): Promise<ethers.BigNumber> {
    const provider = BlockchainProvider.getProvider(network);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    return await tokenContract.balanceOf(walletAddress);
  }

  static validateTransaction(
    network: Network,
    value: ethers.BigNumber
  ): boolean {
    const config = BlockchainProvider.configs[network];
    const maxValue = ethers.utils.parseUnits(config.maxSingleTransaction, 18);
    
    return value.lte(maxValue);
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
