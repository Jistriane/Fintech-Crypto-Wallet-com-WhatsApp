'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tokenService } from '@/services/token';
import type { Token, TokenStats } from '@/types/token';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldOff,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';
import { formatAddress, formatNumber, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, [page, search, selectedNetwork, selectedStatus]);

  async function loadData() {
    try {
      setIsLoading(true);
      const filters = {
        ...(search && { search }),
        ...(selectedNetwork !== 'all' && { network: selectedNetwork }),
        ...(selectedStatus !== 'all' && { status: selectedStatus as any }),
      };

      const [tokensData, statsData] = await Promise.all([
        tokenService.getTokens(page, 10, filters),
        tokenService.getTokenStats(),
      ]);

      setTokens(tokensData.tokens);
      setStats(statsData);
      setTotalPages(Math.ceil(tokensData.total / 10));
    } catch (error) {
      console.error('Erro ao carregar tokens:', error);
      toast.error('Erro ao carregar tokens');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBlockToken(id: string, isBlocked: boolean) {
    try {
      if (isBlocked) {
        await tokenService.unblockToken(id);
        toast.success('Token desbloqueado com sucesso');
      } else {
        await tokenService.blockToken(id);
        toast.success('Token bloqueado com sucesso');
      }
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status do token:', error);
      toast.error('Erro ao alterar status do token');
    }
  }

  async function handleRefreshPrice(id: string) {
    try {
      await tokenService.refreshTokenPrice(id);
      toast.success('Preço atualizado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      toast.error('Erro ao atualizar preço');
    }
  }

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
        <h1 className="text-3xl font-bold">Tokens</h1>
        <p className="text-muted-foreground">
          Gerencie os tokens disponíveis na plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Tokens</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(stats?.totalTokens || 0)}
              </p>
            </div>
            <Coins className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tokens Ativos</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(stats?.activeTokens || 0)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">
                {((stats?.activeTokens || 0) / (stats?.totalTokens || 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Volume 24h</p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(stats?.totalVolume24h || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transações 24h</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(stats?.totalTransactions24h || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder="Buscar por nome ou símbolo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="all">Todas as redes</option>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="bsc">BSC</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Variação 24h</TableHead>
                <TableHead>Volume 24h</TableHead>
                <TableHead>Market Cap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10" />
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.symbol}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">
                        {formatAddress(token.address)}
                      </span>
                      <a
                        href={`https://etherscan.io/token/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {formatCurrency(token.price.brl)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${token.price.usd.toFixed(2)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center space-x-1 ${
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
                  </TableCell>
                  <TableCell>
                    {formatCurrency(token.volume24h)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(token.marketCap)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
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
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/tokens/${token.id}`}
                        className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Detalhes
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshPrice(token.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={token.status === 'blocked' ? 'destructive' : 'ghost'}
                        size="sm"
                        onClick={() => handleBlockToken(token.id, token.status === 'blocked')}
                      >
                        {token.status === 'blocked' ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
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
