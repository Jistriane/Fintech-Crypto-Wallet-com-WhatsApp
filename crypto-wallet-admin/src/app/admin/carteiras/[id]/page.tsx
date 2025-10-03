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
import { walletService } from '@/services/wallet';
import type { Wallet, WalletTransaction } from '@/types/wallet';
import {
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  RefreshCw,
  Download,
  Shield,
  ShieldOff,
  ArrowLeft,
} from 'lucide-react';
import { formatAddress, formatNumber, formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface WalletDetailsProps {
  params: {
    id: string;
  };
}

export default function WalletDetailsPage({ params }: WalletDetailsProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [params.id, page]);

  async function loadData() {
    try {
      setIsLoading(true);
      const [walletData, transactionsData] = await Promise.all([
        walletService.getWallet(params.id),
        walletService.getWalletTransactions(params.id, page, 10),
      ]);

      setWallet(walletData);
      setTransactions(transactionsData.transactions);
      setTotalPages(Math.ceil(transactionsData.total / 10));
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error);
      toast.error('Erro ao carregar dados da carteira');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBlockWallet() {
    if (!wallet) return;
    try {
      if (wallet.status === 'blocked') {
        await walletService.unblockWallet(wallet.id);
        toast.success('Carteira desbloqueada com sucesso');
      } else {
        await walletService.blockWallet(wallet.id);
        toast.success('Carteira bloqueada com sucesso');
      }
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status da carteira:', error);
      toast.error('Erro ao alterar status da carteira');
    }
  }

  async function handleRefreshBalance() {
    if (!wallet) return;
    try {
      await walletService.refreshWalletBalance(wallet.id);
      toast.success('Saldo atualizado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      toast.error('Erro ao atualizar saldo');
    }
  }

  async function handleExportTransactions(format: 'csv' | 'pdf') {
    if (!wallet) return;
    try {
      const blob = await walletService.exportWalletTransactions(wallet.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${wallet.address}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar transações:', error);
      toast.error('Erro ao exportar transações');
    }
  }

  if (isLoading || !wallet) {
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
          <h1 className="text-3xl font-bold">Detalhes da Carteira</h1>
          <p className="text-muted-foreground">
            Informações e transações da carteira
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handleRefreshBalance}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar Saldo
          </Button>
          <Button
            variant={wallet.status === 'blocked' ? 'destructive' : 'outline'}
            onClick={handleBlockWallet}
          >
            {wallet.status === 'blocked' ? (
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
          <Link href="/admin/carteiras">
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
            <div>
              <p className="text-sm text-muted-foreground">Endereço</p>
              <div className="mt-1 flex items-center space-x-2">
                <p className="font-mono font-medium">
                  {formatAddress(wallet.address)}
                </p>
                <a
                  href={`https://etherscan.io/address/${wallet.address}`}
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
              <p className="mt-1 font-medium">{wallet.network}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
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
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className="mt-1 text-2xl font-bold">
                {wallet.balance.native} ETH
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(wallet.balance.usd)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens</p>
              <div className="mt-2 space-y-2">
                {Object.entries(wallet.balance.tokens).map(([symbol, data]) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <span className="font-medium">{symbol}</span>
                    <div className="text-right">
                      <p>{data.balance}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(data.usdValue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Usuário</p>
              <p className="mt-1 font-medium">{wallet.user.name}</p>
              <p className="text-sm text-muted-foreground">
                {wallet.user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criada em</p>
              <p className="mt-1">{formatDate(wallet.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atividade</p>
              <p className="mt-1">{formatDate(wallet.lastActivity)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Transações</h3>
            <p className="text-sm text-muted-foreground">
              Histórico de transações da carteira
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
                <TableHead>Valor</TableHead>
                <TableHead>Token</TableHead>
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
                        tx.type === 'receive'
                          ? 'bg-green-100 text-green-700'
                          : tx.type === 'send'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {tx.type === 'receive'
                        ? 'Recebimento'
                        : tx.type === 'send'
                        ? 'Envio'
                        : tx.type === 'swap'
                        ? 'Swap'
                        : tx.type === 'stake'
                        ? 'Stake'
                        : 'Unstake'}
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
                    <div>
                      <p className="font-medium">{tx.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(tx.usdValue)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{tx.token}</TableCell>
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
