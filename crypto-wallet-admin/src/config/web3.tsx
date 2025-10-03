import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';

// Configuração do projeto Web3Modal
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Please set it in your .env file.\nGet your project ID from https://cloud.walletconnect.com'
  );
}
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Configuração das chains suportadas
const chains = [mainnet, polygon, bsc];

// Configuração dos providers
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

// Configuração do Wagmi
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

// Cliente Ethereum para o Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Componente Web3Modal
export function Web3ModalProvider() {
  return (
    <>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode="dark"
        themeVariables={{
          '--w3m-font-family': 'var(--font-inter)',
          '--w3m-accent-color': 'var(--primary)',
          '--w3m-background-color': 'var(--background)',
          '--w3m-text-color': 'var(--foreground)',
        }}
      />
    </>
  );
}
