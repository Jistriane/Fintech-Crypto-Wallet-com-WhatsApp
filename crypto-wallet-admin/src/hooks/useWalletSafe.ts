import { useState, useCallback } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { toast } from 'react-hot-toast';

export function useWalletSafe() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const [isLoading, setIsLoading] = useState(false);
  const [balance] = useState('0.0'); // Saldo fixo para evitar problemas

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
      toast.success('Carteira desconectada');
    } catch (error) {
      toast.error('Erro ao desconectar carteira');
    }
  }, [disconnect]);

  return {
    connect: connectWallet,
    disconnect: disconnectWallet,
    isConnected,
    isLoading,
    address,
    balance,
  };
}
