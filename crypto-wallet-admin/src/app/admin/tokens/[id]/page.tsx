'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,

  TableRow,
  AreaChart,
  Title,
  Text,
} from '@tremor/react';
import { tokenService } from '@/services/token';
import type { Token, TokenTransaction } from '@/types/token';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Download,
  Shield,
  ShieldOff,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { formatAddress, formatNumber, formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface TokenDetailsProps {
  params: {
    id: string;
  };
}

export default function TokenDetailsPage({ params }: TokenDetailsProps) {
  const [token, setToken] = useState<Token | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [metrics, setMetrics] = useState<Array<{
    timestamp: string;
    price: number;
    volume: number;
    transactions: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [params.id, page]);

  async function loadData() {
    try {
      setIsLoading(true);
      const [tokenData, transactionsData, metricsData] = await Promise.all([
        tokenService.getToken(params.id),
        tokenService.getTokenTransactions(params.id, page, 10),
        tokenService.getTokenMetrics(params.id),
      ]);

      setToken(tokenData);
      setTransactions(transactionsData.transactions);
      setMetrics(metricsData);
      setTotalPages(Math.ceil(transactionsData.total / 10));
    } catch (error) {
      console.error('Erro ao carregar dados do token:', error);
      toast.error('Erro ao carregar dados do token');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBlockToken() {
    if (!token) return;
    try {
      if (token.status === 'blocked') {
        await tokenService.unblockToken(token.id);
        toast.success('Token desbloqueado com sucesso');
      } else {
        await tokenService.blockToken(token.id);
        toast.success('Token bloqueado com sucesso');
      }
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status do token:', error);
      toast.error('Erro ao alterar status do token');
    }
  }

  async function handleRefreshPrice() {
    if (!token) return;
    try {
      await tokenService.refreshTokenPrice(token.id);
      toast.success('Preço atualizado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      toast.error('Erro ao atualizar preço');
    }
  }

  async function handleExportTransactions(format: 'csv' | 'pdf') {
    if (!token) return;
    try {
      const blob = await tokenService.exportTokenTransactions(token.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${token.symbol}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar transações:', error);
      toast.error('Erro ao exportar transações');
    }
  }

  if (isLoading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Token</h1>
          <p className="text-muted-foreground">
            Informações e transações do token
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handleRefreshPrice}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar Preço
          </Button>
          <Button
            variant={token.status === 'blocked' ? 'destructive' : 'outline'}
            onClick={handleBlockToken}
          >
            {token.status === 'blocked' ? (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Desbloquear
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Bloquear
              </>
            )}
          </Button>
          <Link href="/admin/tokens">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/10" />
              <div>
                <p className="text-2xl font-bold">{token.name}</p>
                <p className="text-lg text-muted-foreground">
                  {token.symbol}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Endereço</p>
              <div className="mt-1 flex items-center space-x-2">
                <p className="font-mono font-medium">
                  {formatAddress(token.address)}
                </p>
                <a
                  href={`https://etherscan.io/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rede</p>
              <p className="mt-1 font-medium">{token.network}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  token.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : token.status === 'blocked'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {token.status === 'active'
                  ? 'Ativo'
                  : token.status === 'blocked'
                  ? 'Bloqueado'
                  : 'Inativo'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço</p>
              <div className="mt-1">
                <p className="text-2xl font-bold">
                  {formatCurrency(token.price.brl)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${token.price.usd.toFixed(2)}
                </p>
              </div>
              <div
                className={`mt-2 flex items-center space-x-1 ${
                  token.price.change24h >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {token.price.change24h >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {token.price.change24h >= 0 ? '+' : ''}
                  {token.price.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volume 24h</p>
              <p className="mt-1 text-xl font-bold">
                {formatCurrency(token.volume24h)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="mt-1 text-xl font-bold">
                {formatCurrency(token.marketCap)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Supply Total</p>
              <p className="mt-1 text-xl font-bold">
                {formatNumber(parseFloat(token.totalSupply))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Holders</p>
              <div className="mt-1 flex items-center space-x-2">
                <p className="text-xl font-bold">
                  {formatNumber(token.holders)}
                </p>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Decimais</p>
              <p className="mt-1 font-medium">{token.decimals}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <Title>Preço</Title>
          <Text>Histórico de preço nos últimos 7 dias</Text>
          <AreaChart
            className="mt-4 h-72"
            data={metrics}
            index="timestamp"
            categories={['price']}
            colors={['blue']}
            valueFormatter={(value) => formatCurrency(value)}
            yAxisWidth={100}
          />
        </Card>

        <Card className="p-6">
          <Title>Volume</Title>
          <Text>Volume de transações nos últimos 7 dias</Text>
          <AreaChart
            className="mt-4 h-72"
            data={metrics}
            index="timestamp"
            categories={['volume']}
            colors={['emerald']}
            valueFormatter={(value) => formatCurrency(value)}
            yAxisWidth={100}
          />
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Transações</h3>
            <p className="text-sm text-muted-foreground">
              Histórico de transações do token
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleExportTransactions('csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportTransactions('pdf')}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hash</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>De</TableHead>
                <TableHead>Para</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">
                        {formatAddress(tx.hash)}
                      </span>
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        tx.type === 'mint'
                          ? 'bg-green-100 text-green-700'
                          : tx.type === 'burn'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {tx.type === 'mint'
                        ? 'Mint'
                        : tx.type === 'burn'
                        ? 'Burn'
                        : 'Transfer'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {formatAddress(tx.from)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {formatAddress(tx.to)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{tx.amount}</span>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(tx.usdValue)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tx.status === 'completed'
                        ? 'Concluída'
                        : tx.status === 'pending'
                        ? 'Pendente'
                        : 'Falhou'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(tx.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
