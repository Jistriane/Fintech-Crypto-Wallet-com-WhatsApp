'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  AreaChart,
  BarChart,
  Title,
  Text,
} from '@tremor/react';
import { dashboardService } from '@/services/dashboard';
import type {
  DashboardMetrics,
  ChartData,
  TokenMetrics,
  NetworkMetrics,
} from '@/types/dashboard';
import {
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [metrics, chartData, tokenMetrics, networkMetrics] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getChartData(),
          dashboardService.getTokenMetrics(),
          dashboardService.getNetworkMetrics(),
        ]);

        setMetrics(metrics);
        setChartData(chartData);
        setTokenMetrics(tokenMetrics);
        setNetworkMetrics(networkMetrics);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema Notus Crypto Wallet
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(metrics?.totalUsers || 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500">
              +{metrics?.userGrowth || 0}%
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Carteiras Ativas</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(metrics?.activeWallets || 0)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500">
              +{((metrics?.activeWallets || 0) / (metrics?.totalWallets || 1) * 100).toFixed(1)}%
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Volume Total</p>
              <p className="mt-2 text-3xl font-bold">
                {metrics?.totalVolume || '0'} ETH
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500">
              +{metrics?.transactionGrowth || 0}%
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transações</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(metrics?.totalTransactions || 0)}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <Title>Atividade do Sistema</Title>
          <Text>Volume diário de transações</Text>
          <AreaChart
            className="mt-4 h-72"
            data={chartData}
            index="date"
            categories={['volume']}
            colors={['blue']}
            valueFormatter={(value) => `${value} ETH`}
            yAxisWidth={60}
          />
        </Card>

        <Card className="p-6">
          <Title>Usuários Ativos</Title>
          <Text>Usuários ativos por dia</Text>
          <BarChart
            className="mt-4 h-72"
            data={chartData}
            index="date"
            categories={['activeUsers']}
            colors={['emerald']}
            valueFormatter={formatNumber}
            yAxisWidth={60}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <Title>Top Tokens</Title>
          <Text>Tokens mais populares na plataforma</Text>
          <div className="mt-4 space-y-4">
            {tokenMetrics.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10" />
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {token.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(token.price)}
                  </p>
                  <div
                    className={`flex items-center space-x-1 ${
                      token.priceChange24h >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {token.priceChange24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>
                      {token.priceChange24h >= 0 ? '+' : ''}
                      {token.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <Title>Redes</Title>
          <Text>Atividade por rede blockchain</Text>
          <div className="mt-4 space-y-4">
            {networkMetrics.map((network) => (
              <div
                key={network.network}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10" />
                  <div>
                    <p className="font-medium">{network.network}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(network.transactions)} transações
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {network.volume.toFixed(2)} ETH
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(network.activeWallets)} carteiras
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
