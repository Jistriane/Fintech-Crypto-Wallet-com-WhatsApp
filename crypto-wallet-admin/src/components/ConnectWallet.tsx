import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { formatEther } from 'viem';
import { useCallback } from 'react';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const { connect, connectors } = useConnect();

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col space-y-2">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="w-full"
            disabled={!connector.ready}
          >
            <Icons.wallet className="mr-2 h-4 w-4" />
            {connector.name === 'WalletConnect' ? 'WalletConnect' : 'Conectar Carteira'}
          </Button>
        ))}
      </div>
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
                {balance ? formatEther(balance.value) : '0'} ETH
              </div>
              <div className="text-sm text-muted-foreground">
                Saldo
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => disconnect()}
            >
              <Icons.logout className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}