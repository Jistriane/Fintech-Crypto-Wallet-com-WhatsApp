import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { createWeb3Modal } from '@web3modal/wagmi/react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, bsc],
  [w3mProvider({ projectId })]
);

export const config = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    chains,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-font-family': 'Inter, sans-serif',
      '--w3m-accent': 'rgb(59, 130, 246)',
    },
  });
}