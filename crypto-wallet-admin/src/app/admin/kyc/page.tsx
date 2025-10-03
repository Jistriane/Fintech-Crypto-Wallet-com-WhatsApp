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
  BarChart,
  Title,
  Text,
} from '@tremor/react';
import { kycService } from '@/services/kyc';
import type { KYCRequest, KYCStats } from '@/types/kyc';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Search,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function KYCPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    loadData();
  }, [page, search, selectedStatus, selectedLevel]);

  async function loadData() {
    try {
      setIsLoading(true);
      const filters = {
        ...(search && { search }),
        ...(selectedStatus !== 'all' && { status: selectedStatus as any }),
        ...(selectedLevel !== 'all' && { level: parseInt(selectedLevel) }),
      };

      const [requestsData, statsData] = await Promise.all([
        kycService.getRequests(page, 10, filters),
        kycService.getStats(),
      ]);

      setRequests(requestsData.requests);
      setStats(statsData);
      setTotalPages(Math.ceil(requestsData.total / 10));
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExport(format: 'csv' | 'pdf') {
    try {
      const filters = {
        ...(search && { search }),
        ...(selectedStatus !== 'all' && { status: selectedStatus as any }),
        ...(selectedLevel !== 'all' && { level: parseInt(selectedLevel) }),
      };

      const blob = await kycService.exportRequests(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyc-requests.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar solicitações:', error);
      toast.error('Erro ao exportar solicitações');
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
        <h1 className="text-3xl font-bold">Verificação KYC</h1>
        <p className="text-muted-foreground">
          Gerencie e revise as solicitações de verificação KYC
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de Solicitações
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(stats?.totalRequests || 0)}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Solicitações Pendentes
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatNumber(stats?.pendingRequests || 0)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Taxa de Aprovação
              </p>
              <p className="mt-2 text-3xl font-bold">
                {stats?.completionRate.toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Tempo Médio de Análise
              </p>
              <p className="mt-2 text-3xl font-bold">
                {stats?.averageReviewTime}h
              </p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="relative flex-1 max-w-xs">
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="in_review">Em Análise</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-md border px-3 py-2"
            >
              <option value="all">Todos os níveis</option>
              <option value="1">Nível 1</option>
              <option value="2">Nível 2</option>
              <option value="3">Nível 3</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
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
                <TableHead>Usuário</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                      Nível {request.level}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {request.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : request.status === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : request.status === 'in_review' ? (
                        <Clock className="h-4 w-4 text-blue-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span
                        className={`text-sm ${
                          request.status === 'approved'
                            ? 'text-green-700'
                            : request.status === 'rejected'
                            ? 'text-red-700'
                            : request.status === 'in_review'
                            ? 'text-blue-700'
                            : 'text-yellow-700'
                        }`}
                      >
                        {request.status === 'approved'
                          ? 'Aprovado'
                          : request.status === 'rejected'
                          ? 'Rejeitado'
                          : request.status === 'in_review'
                          ? 'Em Análise'
                          : 'Pendente'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {request.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/10"
                          title={doc.type}
                        >
                          <span className="text-xs font-medium">
                            {doc.type.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{formatDate(request.createdAt)}</p>
                      {request.reviewedAt && (
                        <p className="text-sm text-muted-foreground">
                          Revisado em {formatDate(request.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/kyc/${request.id}`}
                      className="inline-flex items-center space-x-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Revisar</span>
                    </Link>
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
