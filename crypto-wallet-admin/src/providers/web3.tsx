'use client';

import { WagmiConfig } from 'wagmi';
import { config } from '@/config/wagmi';

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
}