'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useChainId, useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// ERC20 ABI mínimo para leitura de saldo e informações básicas
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

// Lista de tokens populares por rede
const TOKENS = {
  1: [ // Mainnet
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logo: 'https://assets.coingecko.com/coins/images/325/thumb/Tether.png',
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logo: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      logo: 'https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png',
    },
  ],
  137: [ // Polygon
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logo: 'https://assets.coingecko.com/coins/images/325/thumb/Tether.png',
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logo: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
  ],
  56: [ // BSC
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      logo: 'https://assets.coingecko.com/coins/images/325/thumb/Tether.png',
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      logo: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
  ],
};

interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  logo: string;
}

export default function TokensPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Obtém a lista de tokens para a rede atual
  const networkTokens = chainId ? TOKENS[chainId as keyof typeof TOKENS] || [] : [];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = networkTokens.map(t => t.symbol.toLowerCase()).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`
        );
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    if (networkTokens.length > 0) {
      fetchPrices();
    }
  }, [chainId]);

  // Lê os saldos dos tokens
  useEffect(() => {
    const fetchBalances = async () => {
      if (!address || !chainId) return;

      const balances = await Promise.all(
        networkTokens.map(async (token) => {
          try {
            const balance = await useContractRead({
              address: token.address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [address as `0x${string}`],
            });

            const formattedBalance = formatUnits(balance.data || 0n, token.decimals);
            const usdPrice = prices[token.symbol.toLowerCase()]?.usd || 0;
            const usdValue = (parseFloat(formattedBalance) * usdPrice).toFixed(2);

            return {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              balance: formattedBalance,
              usdValue,
              logo: token.logo,
            };
          } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error);
            return null;
          }
        })
      );

      setTokenBalances(balances.filter((b): b is TokenBalance => b !== null));
      setLoading(false);
    };

    fetchBalances();
  }, [address, chainId, prices]);

  if (!address) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Carteira não conectada</CardTitle>
            <CardDescription>
              Por favor, conecte sua carteira para ver seus tokens.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Seus Tokens</CardTitle>
          <CardDescription>
            Lista de tokens ERC20 em sua carteira na {chainId ? TOKENS[chainId as keyof typeof TOKENS] ? `rede ${chainId === 1 ? 'Ethereum' : chainId === 137 ? 'Polygon' : 'BSC'}` : 'rede atual' : 'rede atual'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {tokenBalances.map((token) => (
                <div
                  key={token.address}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-gray-500">{token.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {parseFloat(token.balance).toFixed(6)} {token.symbol}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${token.usdValue} USD
                    </div>
                  </div>
                </div>
              ))}
              {tokenBalances.length === 0 && (
                <div className="text-center text-gray-500">
                  Nenhum token encontrado nesta rede
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}