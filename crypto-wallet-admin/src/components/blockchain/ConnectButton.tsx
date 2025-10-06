'use client';

import { useWalletSafe } from '@/hooks/useWalletSafe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, ChevronDown, ExternalLink, Power } from 'lucide-react';
import { useState } from 'react';

export function ConnectButton() {
  const {
    connect,
    disconnect,
    isConnected,
    isLoading,
    address,
    balance,
  } = useWalletSafe();

  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading) {
    return (
      <Button disabled variant="outline">
        Conectando...
      </Button>
    );
  }

  if (!isConnected || !address) {
    return (
      <Button onClick={connect} variant="outline">
        <Wallet className="mr-2 h-4 w-4" />
        Conectar Carteira
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden md:inline">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <Card className="absolute right-0 mt-2 w-72 p-4 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Carteira</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="font-medium">
              {Number(balance).toFixed(4)} ETH
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              disconnect();
              setShowDropdown(false);
            }}
          >
            <Power className="mr-2 h-4 w-4" />
            Desconectar
          </Button>
        </Card>
      )}
    </div>
  );
}
