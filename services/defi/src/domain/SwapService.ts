import { ethers } from 'ethers';
import { IWalletRepository } from '@common/domain/repositories/IWalletRepository';
import { ITransactionRepository } from '@common/domain/repositories/ITransactionRepository';
import { IUserRepository } from '@common/domain/repositories/IUserRepository';
import { SmartWallet } from '@common/domain/entities/SmartWallet';
import { Transaction } from '@common/domain/entities/Transaction';
import { Token } from '@common/types';
import { BlockchainService } from '@common/infrastructure/blockchain/services/BlockchainService';
import { NotusWhatsAppService } from '../../infrastructure/whatsapp/NotusWhatsAppService';
import { KYC_LEVELS } from '@common/constants/kyc';

interface SwapRoute {
  path: Token[];
  amountOut: ethers.BigNumber;
  priceImpact: number;
  fee: ethers.BigNumber;
}

export class SwapService {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly userRepository: IUserRepository,
    private readonly whatsappService: NotusWhatsAppService
  ) {}

  async getSwapQuote(
    walletId: string,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: ethers.BigNumber
  ): Promise<SwapRoute> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Verificar saldo
    if (!wallet.hasEnoughBalance(tokenIn, amountIn)) {
      throw new Error('Insufficient balance');
    }

    // TODO: Implementar integração real com DEX para obter rota
    const route = await this.findBestRoute(wallet, tokenIn, tokenOut, amountIn);

    return route;
  }

  async executeSwap(
    walletId: string,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: ethers.BigNumber,
    minAmountOut: ethers.BigNumber
  ): Promise<Transaction> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const user = await this.userRepository.findById(wallet.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar limites de KYC
    const kycLimits = KYC_LEVELS[user.kycLevel];
    if (amountIn.gt(ethers.utils.parseUnits(kycLimits.singleTransactionLimit.toString(), tokenIn.decimals))) {
      throw new Error('Swap amount exceeds KYC limit');
    }

    // Obter rota de swap
    const route = await this.getSwapQuote(walletId, tokenIn, tokenOut, amountIn);

    // Verificar slippage
    if (route.amountOut.lt(minAmountOut)) {
      throw new Error('Slippage too high');
    }

    // Criar transação
    const transaction = new Transaction(
      ethers.utils.id(Date.now().toString()),
      walletId,
      'SWAP',
      'PENDING',
      wallet.address,
      this.getRouterAddress(wallet.network), // Endereço do router DEX
      tokenIn,
      amountIn,
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
      const hash = await this.executeSwapTransaction(wallet, route, transaction);
      transaction.hash = hash;
      await this.transactionRepository.update(transaction);

      // Monitorar transação
      BlockchainService.monitorTransaction(wallet, transaction)
        .then(async (success) => {
          if (success) {
            // Atualizar saldos
            const newBalanceIn = wallet.getBalance(tokenIn).sub(amountIn);
            const newBalanceOut = wallet.getBalance(tokenOut).add(route.amountOut);
            
            await Promise.all([
              this.walletRepository.updateBalance(walletId, tokenIn, newBalanceIn),
              this.walletRepository.updateBalance(walletId, tokenOut, newBalanceOut)
            ]);

            // Notificar sucesso via WhatsApp
            await this.whatsappService.notifySwapSuccess(
              user.phone,
              user.id,
              {
                tokenIn,
                amountIn,
                tokenOut,
                amountOut: route.amountOut
              }
            );
          }
        });

      return savedTransaction;
    } catch (error) {
      transaction.fail(error.message);
      await this.transactionRepository.update(transaction);

      // Notificar falha via WhatsApp
      await this.whatsappService.notifySwapFailure(
        user.phone,
        user.id,
        {
          tokenIn,
          amountIn,
          tokenOut,
          error: error.message
        }
      );

      throw error;
    }
  }

  private async findBestRoute(
    wallet: SmartWallet,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: ethers.BigNumber
  ): Promise<SwapRoute> {
    // TODO: Implementar lógica real de roteamento
    // Por enquanto, retorna uma rota simulada
    return {
      path: [tokenIn, tokenOut],
      amountOut: amountIn.mul(98).div(100), // Simula 2% de slippage
      priceImpact: 0.5,
      fee: amountIn.mul(3).div(1000) // 0.3% fee
    };
  }

  private getRouterAddress(network: string): string {
    // TODO: Implementar mapeamento real de endereços de router
    const routers = {
      POLYGON: '0x1234...', // Endereço do QuickSwap Router
      BSC: '0x5678...' // Endereço do PancakeSwap Router
    };

    return routers[network as keyof typeof routers];
  }

  private async executeSwapTransaction(
    wallet: SmartWallet,
    route: SwapRoute,
    transaction: Transaction
  ): Promise<string> {
    // TODO: Implementar lógica real de swap
    // Por enquanto, simula uma transação de swap
    return await BlockchainService.sendTransaction(wallet, transaction);
  }

  async estimateGas(
    walletId: string,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: ethers.BigNumber
  ): Promise<ethers.BigNumber> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // TODO: Implementar estimativa real de gas
    return ethers.BigNumber.from('200000'); // Gas estimado para swap
  }
}
