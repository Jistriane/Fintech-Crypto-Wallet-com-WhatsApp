import { useAccount, useChainId, useBalance, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';
import { formatEther } from 'viem';
import { useCallback } from 'react';

const chainInfo = {
  1: { name: 'Ethereum', symbol: 'ETH', icon: Icons.eth },
  137: { name: 'Polygon', symbol: 'MATIC', icon: Icons.polygon },
  56: { name: 'BSC', symbol: 'BNB', icon: Icons.bnb },
  42161: { name: 'Arbitrum', symbol: 'ETH', icon: Icons.arbitrum },
} as const;

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const getChainInfo = useCallback((id: number) => {
    return chainInfo[id as keyof typeof chainInfo] || { 
      name: 'Unknown Network', 
      symbol: 'ETH',
      icon: Icons.eth
    };
  }, []);

  const { open } = useWeb3Modal();

  if (!isConnected || !address) {
    return (
      <Button
        onClick={() => open()}
        className="w-full"
      >
        <Icons.wallet className="mr-2 h-4 w-4" />
        Conectar Carteira
      </Button>
    );
  }

  const chain = getChainInfo(chainId);
  const ChainIcon = chain.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ChainIcon className="h-8 w-8" />
            <div>
              <div className="font-medium">{chain.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatAddress(address)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium">
                {balance ? formatEther(balance.value) : '0'} {chain.symbol}
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