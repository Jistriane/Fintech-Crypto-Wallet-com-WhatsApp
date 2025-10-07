'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  ShieldOff, 
  ArrowLeft,
  Wallet,
  Activity,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'blocked' | 'pending';
  role: string;
  createdAt: string;
  lastLogin: string;
  walletAddress: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  totalTransactions: number;
  totalVolume: string;
}

interface UserDetailsProps {
  params: {
    id: string;
  };
}

export default function UserDetailsPage({ params }: UserDetailsProps) {
  const resolvedParams = use(params);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [resolvedParams.id]);

  async function loadUserData() {
    try {
      setIsLoading(true);
      
      // Buscar dados reais do usuário da API
      const response = await fetch(`/users/${resolvedParams.id}`, {
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Usuário não encontrado');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleStatus = async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: user.status === 'active' ? 'blocked' : 'active'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar status do usuário');
      }
      
      setUser(prev => prev ? {
        ...prev,
        status: prev.status === 'active' ? 'blocked' : 'active'
      } : null);
      
      toast.success(`Usuário ${user.status === 'active' ? 'bloqueado' : 'desbloqueado'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default">Verificado</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Usuário não encontrado</h2>
          <p className="text-muted-foreground">O usuário solicitado não foi encontrado.</p>
          <Link href="/admin/usuarios">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Usuários
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Usuário</h1>
          <p className="text-muted-foreground">
            Informações completas do usuário {user.name}
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant={user.status === 'active' ? 'destructive' : 'default'}
            onClick={handleToggleStatus}
            disabled={isUpdating}
          >
            {user.status === 'active' ? (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Bloquear Usuário
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Desbloquear Usuário
              </>
            )}
          </Button>
          <Link href="/admin/usuarios">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nome</span>
              <span className="text-sm">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Telefone</span>
              <span className="text-sm">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Localização</span>
              <span className="text-sm">{user.location}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              {getStatusBadge(user.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Função</span>
              <span className="text-sm capitalize">{user.role}</span>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ID do Usuário</span>
              <span className="text-sm font-mono">{user.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Membro desde</span>
              <span className="text-sm">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Último login</span>
              <span className="text-sm">{new Date(user.lastLogin).toLocaleString('pt-BR')}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">KYC Status</span>
              {getKYCStatusBadge(user.kycStatus)}
            </div>
          </CardContent>
        </Card>

        {/* Carteira e Transações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Carteira e Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Endereço da Carteira</span>
              <span className="text-sm font-mono">{user.walletAddress.slice(0, 10)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total de Transações</span>
              <span className="text-sm font-bold">{user.totalTransactions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Volume Total</span>
              <span className="text-sm font-bold">{user.totalVolume}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Wallet className="mr-2 h-4 w-4" />
                Ver Carteira
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                Ver Transações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transações</p>
                <p className="text-2xl font-bold">{user.totalTransactions}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-2xl font-bold">{user.totalVolume}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status KYC</p>
                <p className="text-2xl font-bold">
                  {user.kycStatus === 'verified' ? '✓' : user.kycStatus === 'pending' ? '⏳' : '✗'}
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dias Ativo</p>
                <p className="text-2xl font-bold">
                  {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
