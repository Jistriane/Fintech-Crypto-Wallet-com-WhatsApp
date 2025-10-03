import { createConfig, http } from 'wagmi';
import { mainnet, polygon, bsc } from 'viem/chains';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const metadata = {
  name: 'Crypto Wallet',
  description: 'Carteira Digital com WhatsApp',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001',
  icons: ['/icon.png']
};

const chains = [mainnet, polygon, bsc] as const;

// Configuração do Wagmi com Web3Modal
export const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
  connectors: [
    walletConnect({
      projectId,
      metadata,
      showQrModal: false,
    }),
  ],
});

// Configuração do Web3Modal (apenas no lado do cliente)
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-font-family': 'Inter, sans-serif',
      '--w3m-accent': 'rgb(59, 130, 246)',
    },
    defaultChain: mainnet,
    includeWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Trust
    ],
  });
}