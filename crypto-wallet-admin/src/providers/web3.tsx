'use client';

import { createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const config = createConfig({
  chains: [mainnet, polygon, bsc],
  connectors: [
    new InjectedConnector({
      chains: [mainnet, polygon, bsc],
      options: {
        name: 'MetaMask',
        shimDisconnect: true,
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
  ssr: true,
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        {children}
      </WagmiConfig>
    </QueryClientProvider>
  );
}