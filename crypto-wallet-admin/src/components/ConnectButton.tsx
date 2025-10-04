import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { formatEther } from 'viem';
import { useCallback } from 'react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { connect, connectors, isLoading } = useConnect();

  const formatAddress = useCallback((addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  if (!isConnected || !address) {
    const connector = connectors[0];
    const isMetaMaskAvailable = connector?.ready;

    return (
      <Button
        onClick={() => connect({ connector })}
        className="w-full"
        disabled={isLoading || !isMetaMaskAvailable}
      >
        <Icons.wallet className="mr-2 h-4 w-4" />
        {isLoading ? 'Conectando...' : 
         !isMetaMaskAvailable ? 'MetaMask não encontrado' : 
         'Conectar MetaMask'}
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
              <div className="font-medium">Ethereum</div>
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
