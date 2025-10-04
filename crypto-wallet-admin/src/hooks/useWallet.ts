import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useDisconnect, useChainId, useConnect } from 'wagmi';
import { formatEther } from 'viem';
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from '@/config/chains';
import type { WalletBalance, SupportedChain } from '@/types/blockchain';
import { toast } from 'react-hot-toast';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const [walletInfo, setWalletInfo] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verifica se a rede atual é suportada
  const isChainSupported = useCallback(() => {
    if (!chainId) return false;
    return Object.values(SUPPORTED_CHAINS).some(
      (supportedChain) => supportedChain.id === chainId
    );
  }, [chainId]);

  // Obtém o nome da rede atual
  const getCurrentChain = useCallback(() => {
    if (!chainId) return null;
    return Object.entries(SUPPORTED_CHAINS).find(
      ([, value]) => value.id === chainId
    )?.[0];
  }, [chainId]);

  // Conecta a carteira
  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      const connector = connectors[0]; // MetaMask
      if (!connector) {
        throw new Error('MetaMask não encontrado. Por favor, instale a extensão MetaMask.');
      }
      await connect({ connector });
      toast.success('Carteira conectada com sucesso');
    } catch (error: any) {
      console.error('Erro ao conectar carteira:', error);
      if (error.message.includes('User rejected')) {
        toast.error('Conexão rejeitada. Por favor, aprove a conexão no MetaMask.');
      } else if (error.message.includes('MetaMask não encontrado')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao conectar carteira. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [connect, connectors]);

  // Desconecta a carteira
  const disconnectWallet = useCallback(() => {
    try {
      disconnect();
      setWalletInfo(null);
      toast.success('Carteira desconectada');
    } catch (error) {
      console.error('Erro ao desconectar carteira:', error);
      toast.error('Erro ao desconectar carteira');
    }
  }, [disconnect]);

  // Atualiza as informações da carteira quando houver mudanças
  useEffect(() => {
    if (isConnected && address && balance) {
      const currentChain = getCurrentChain();
      if (currentChain) {
        setWalletInfo({
          chain: currentChain as SupportedChain,
          address,
          balance: formatEther(balance.value),
          tokens: {},
        });
      }
    } else {
      setWalletInfo(null);
    }
  }, [isConnected, address, balance, getCurrentChain]);

  return {
    connect: connectWallet,
    disconnect: disconnectWallet,
    isConnected,
    isLoading,
    walletInfo,
    isChainSupported,
    supportedChains: SUPPORTED_CHAINS,
    supportedTokens: SUPPORTED_TOKENS,
  };
}
