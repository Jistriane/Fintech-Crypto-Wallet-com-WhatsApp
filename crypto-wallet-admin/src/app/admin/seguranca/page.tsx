'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, AlertTriangle, Check, Smartphone, Monitor, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  location: string;
  ip: string;
  lastAccess: string;
  isCurrent: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  monitoringEnabled: boolean;
  ipBlockingEnabled: boolean;
  sessionTimeout: number;
  maxFailedAttempts: number;
}

export default function SecurityPage() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Chrome - Windows',
      type: 'desktop',
      location: 'São Paulo, Brasil',
      ip: '192.168.1.1',
      lastAccess: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: '2',
      name: 'Safari - iPhone',
      type: 'mobile',
      location: 'Rio de Janeiro, Brasil',
      ip: '192.168.1.2',
      lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isCurrent: false,
    },
  ]);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    monitoringEnabled: true,
    ipBlockingEnabled: true,
    sessionTimeout: 30,
    maxFailedAttempts: 5,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [deviceToRevoke, setDeviceToRevoke] = useState<Device | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error('Erro ao carregar dados de segurança');
    } finally {
      setIsLoading(false);
    }
  }

  const handleRevokeDevice = async (device: Device) => {
    try {
      setIsLoading(true);
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDevices(prev => prev.filter(d => d.id !== device.id));
      toast.success(`Dispositivo ${device.name} revogado com sucesso`);
      setShowRevokeDialog(false);
      setDeviceToRevoke(null);
    } catch (error) {
      toast.error('Erro ao revogar dispositivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: enabled }));
      toast.success(`2FA ${enabled ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao alterar configuração de 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMonitoring = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecuritySettings(prev => ({ ...prev, monitoringEnabled: enabled }));
      toast.success(`Monitoramento ${enabled ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao alterar configuração de monitoramento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleIPBlocking = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecuritySettings(prev => ({ ...prev, ipBlockingEnabled: enabled }));
      toast.success(`Bloqueio de IP ${enabled ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      toast.error('Erro ao alterar configuração de bloqueio de IP');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "secondary"}>
        {status ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  if (isLoading && devices.length === 0) {
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

      {/* Cards de Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securitySettings.twoFactorEnabled ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">
              Autenticação em dois fatores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              Dispositivos conectados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoramento</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securitySettings.monitoringEnabled ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoramento de atividades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueio IP</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securitySettings.ipBlockingEnabled ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">
              Bloqueio de IPs suspeitos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Segurança</CardTitle>
          <CardDescription>
            Gerencie as configurações de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-base font-medium">Autenticação em Dois Fatores (2FA)</div>
              <div className="text-sm text-muted-foreground">
                Adicione uma camada extra de segurança à sua conta
              </div>
            </div>
            <Switch
              checked={securitySettings.twoFactorEnabled}
              onCheckedChange={handleToggle2FA}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-base font-medium">Monitoramento de Atividades</div>
              <div className="text-sm text-muted-foreground">
                Monitore atividades suspeitas na sua conta
              </div>
            </div>
            <Switch
              checked={securitySettings.monitoringEnabled}
              onCheckedChange={handleToggleMonitoring}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-base font-medium">Bloqueio de IPs Suspeitos</div>
              <div className="text-sm text-muted-foreground">
                Bloqueie automaticamente IPs com atividades suspeitas
              </div>
            </div>
            <Switch
              checked={securitySettings.ipBlockingEnabled}
              onCheckedChange={handleToggleIPBlocking}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dispositivos Conectados */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Conectados</CardTitle>
          <CardDescription>
            Gerencie os dispositivos que têm acesso à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(device.type)}
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {device.type}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>{device.ip}</TableCell>
                  <TableCell>
                    {new Date(device.lastAccess).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {device.isCurrent ? (
                      <Badge variant="default">Atual</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!device.isCurrent && (
                      <Dialog open={showRevokeDialog && deviceToRevoke?.id === device.id}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeviceToRevoke(device)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Revogar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Revogar Dispositivo</DialogTitle>
                            <DialogDescription>
                              Tem certeza que deseja revogar o acesso do dispositivo{' '}
                              <strong>{device.name}</strong>? Esta ação não pode ser desfeita.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowRevokeDialog(false);
                                setDeviceToRevoke(null);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setShowRevokeDialog(true);
                                handleRevokeDevice(device);
                              }}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Revogando...' : 'Revogar'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}