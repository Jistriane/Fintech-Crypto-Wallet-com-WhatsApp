import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { useCallback } from 'react';
import { useWalletSafe } from '@/hooks/useWalletSafe';

export function ConnectButton() {
  const {
    connect,
    disconnect,
    isConnected,
    isLoading,
    address,
    balance,
  } = useWalletSafe();

  const formatAddress = useCallback((addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  if (!isConnected || !address) {
    return (
      <Button
        onClick={connect}
        className="w-full"
        disabled={isLoading}
      >
        <Icons.wallet className="mr-2 h-4 w-4" />
        {isLoading ? 'Conectando...' : 'Conectar MetaMask'}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Icons.eth className="h-8 w-8" />
            <div>
              <div className="font-medium">Carteira Conectada</div>
              <div className="text-sm text-muted-foreground">
                {formatAddress(address)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium">
                {balance} ETH
              </div>
              <div className="text-sm text-muted-foreground">
                Saldo
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={disconnect}
            >
              <Icons.logout className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
