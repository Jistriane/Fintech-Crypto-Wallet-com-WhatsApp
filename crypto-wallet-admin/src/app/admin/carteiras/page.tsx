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

  TableRow,
} from '@tremor/react';
import { walletService } from '@/services/wallet';
import type { Wallet, WalletStats } from '@/types/wallet';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  ShieldOff,
  ExternalLink,
  RefreshCw,
  Download,
} from 'lucide-react';
import { formatAddress, formatNumber, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
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

      const [walletsData, statsData] = await Promise.all([
        walletService.getWallets(page, 10, filters),
        walletService.getWalletStats(),
      ]);

      setWallets(walletsData.wallets);
      setStats(statsData);
      setTotalPages(Math.ceil(walletsData.total / 10));
    } catch (error) {
      console.error('Erro ao carregar carteiras:', error);
      toast.error('Erro ao carregar carteiras');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBlockWallet(id: string, isBlocked: boolean) {
    try {
      if (isBlocked) {
        await walletService.unblockWallet(id);
        toast.success('Carteira desbloqueada com sucesso');
      } else {
        await walletService.blockWallet(id);
        toast.success('Carteira bloqueada com sucesso');
      }
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status da carteira:', error);
      toast.error('Erro ao alterar status da carteira');
    }
  }

  async function handleRefreshBalance(id: string) {
    try {
      await walletService.refreshWalletBalance(id);
      toast.success('Saldo atualizado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      toast.error('Erro ao atualizar saldo');
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
        <h1 className="text-3xl font-bold">Carteiras</h1>
        <p className="text-muted-foreground">
          Gerencie as carteiras dos usuários
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Carteiras</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(stats?.totalWallets || 0)}
              </p>
            </div>
            <WalletIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Carteiras Ativas</p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(stats?.activeWallets || 0)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">
                {((stats?.activeWallets || 0) / (stats?.totalWallets || 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Volume 24h</p>
              <p className="mt-2 text-3xl font-bold">
                {stats?.totalVolume24h || '0'} ETH
              </p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-green-500" />
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
            <Input
              placeholder="Buscar por endereço ou usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
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
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
              <option value="blocked">Bloqueadas</option>
            </select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endereço</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Rede</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">
                        {formatAddress(wallet.address)}
                      </span>
                      <a
                        href={`https://etherscan.io/address/${wallet.address}`}
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
                      <p className="font-medium">{wallet.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {wallet.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{wallet.network}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {wallet.balance.native} ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(wallet.balance.usd)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        wallet.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : wallet.status === 'blocked'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {wallet.status === 'active'
                        ? 'Ativa'
                        : wallet.status === 'blocked'
                        ? 'Bloqueada'
                        : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(wallet.lastActivity).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/carteiras/${wallet.id}`}
                        className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Detalhes
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshBalance(wallet.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={wallet.status === 'blocked' ? 'destructive' : 'ghost'}
                        size="sm"
                        onClick={() => handleBlockWallet(wallet.id, wallet.status === 'blocked')}
                      >
                        {wallet.status === 'blocked' ? (
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
