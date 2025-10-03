'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { formatEther } from 'viem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export default function DashboardPage() {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    address,
  });

  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch token prices from CoinGecko
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,binancecoin&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();

        const prices = [
          {
            symbol: 'ETH',
            price: data.ethereum.usd,
            change24h: data.ethereum.usd_24h_change,
          },
          {
            symbol: 'BTC',
            price: data.bitcoin.usd,
            change24h: data.bitcoin.usd_24h_change,
          },
          {
            symbol: 'BNB',
            price: data.binancecoin.usd,
            change24h: data.binancecoin.usd_24h_change,
          },
        ];

        setTokenPrices(prices);

        // Calculate total value
        if (balance) {
          const ethPrice = data.ethereum.usd;
          const balanceInEth = parseFloat(formatEther(balance.value));
          const valueInUsd = (balanceInEth * ethPrice).toFixed(2);
          setTotalValue(valueInUsd);
        }

        // Fetch recent transactions
        if (address) {
          const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
          const txResponse = await fetch(
            `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${etherscanApiKey}`
          );
          const txData = await txResponse.json();
          if (txData.status === '1') {
            setRecentTransactions(txData.result);
          }
        }

        // Fetch price history
        const historyResponse = await fetch(
          'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily'
        );
        const historyData = await historyResponse.json();
        const formattedHistory = historyData.prices.map(([timestamp, price]: [number, number]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price: price.toFixed(2),
        }));
        setPriceHistory(formattedHistory);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [address, balance, chain?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Saldo Total</CardTitle>
            <CardDescription>Em USD</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue}</div>
          </CardContent>
        </Card>

        {tokenPrices.map((token) => (
          <Card key={token.symbol}>
            <CardHeader>
              <CardTitle>{token.symbol}</CardTitle>
              <CardDescription>Preço atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${token.price.toFixed(2)}</div>
              <div
                className={`text-sm ${
                  token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {token.change24h.toFixed(2)}% (24h)
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Preço do ETH (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="font-medium">
                    {tx.from.slice(0, 6)}...{tx.from.slice(-4)} →{' '}
                    {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {formatEther(tx.value)} ETH
                  </div>
                  <a
                    href={`https://${chain?.id === 1 ? '' : chain?.name.toLowerCase() + '.'}etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Ver transação
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}