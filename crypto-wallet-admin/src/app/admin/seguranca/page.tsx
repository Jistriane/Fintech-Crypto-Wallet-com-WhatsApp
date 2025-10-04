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
} from '@tremor/react';
import { Shield, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SecurityPage() {
  const [securityStatus, setSecurityStatus] = useState({
    twoFactorEnabled: false,
    lastLogin: new Date().toISOString(),
    activeDevices: 0,
    failedAttempts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      // TODO: Implementar chamada real para API
      setSecurityStatus({
        twoFactorEnabled: true,
        lastLogin: new Date().toISOString(),
        activeDevices: 3,
        failedAttempts: 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
      toast.error('Erro ao carregar dados de segurança');
    } finally {
      setIsLoading(false);
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
        <h1 className="text-3xl font-bold">Segurança</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações de segurança do sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">2FA</p>
              <p className="mt-2 text-3xl font-bold">
                {securityStatus.twoFactorEnabled ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dispositivos Ativos</p>
              <p className="mt-2 text-3xl font-bold">{securityStatus.activeDevices}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tentativas Falhas</p>
              <p className="mt-2 text-3xl font-bold">{securityStatus.failedAttempts}</p>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Status de Segurança</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Verificação</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Última Atualização</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Autenticação em Dois Fatores</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Ativo
                  </span>
                </TableCell>
                <TableCell>{new Date().toLocaleString('pt-BR')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Monitoramento de Atividades</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Ativo
                  </span>
                </TableCell>
                <TableCell>{new Date().toLocaleString('pt-BR')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bloqueio de IPs Suspeitos</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Ativo
                  </span>
                </TableCell>
                <TableCell>{new Date().toLocaleString('pt-BR')}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Dispositivos Conectados</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dispositivo</TableCell>
                <TableCell>Local</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Último Acesso</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Chrome - Windows</TableCell>
                <TableCell>São Paulo, Brasil</TableCell>
                <TableCell>192.168.1.1</TableCell>
                <TableCell>{new Date().toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm">
                    Revogar
                  </Button>
                </TableCell>
              </TableRow>
              {/* Adicione mais linhas conforme necessário */}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}