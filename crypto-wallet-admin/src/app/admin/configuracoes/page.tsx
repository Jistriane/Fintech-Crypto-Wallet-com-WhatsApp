'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Shield, Bell, Globe, Clock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    language: 'pt_BR',
    theme: 'light',
    notifications: false,
    email: '',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    twoFactor: false,
    sessionTimeout: 30,
    autoLogout: true,
    securityLevel: 'medium'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Sincronizar tema quando o componente monta
  useEffect(() => {
    if (theme && theme !== settings.theme) {
      setSettings(prev => ({ ...prev, theme }));
    }
  }, [theme]);

  // Detectar mudanças
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  // Debug: Log das configurações quando mudam
  useEffect(() => {
  }, [settings]);

  async function loadData() {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:3333/settings', {
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações');
      }

      const data = await response.json();
      setSettings(data);
      
      // Sincronizar tema com o sistema
      if (data.theme && data.theme !== theme) {
        setTheme(data.theme);
      }
    } catch (error) {
      toast.error('Erro ao carregar configurações');
      
      // Em caso de erro, manter valores padrão
      setSettings({
        language: 'pt_BR',
        theme: 'light',
        notifications: false,
        email: '',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        twoFactor: false,
        sessionTimeout: 30,
        autoLogout: true,
        securityLevel: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validar campos obrigatórios
      if (!settings.language || !settings.theme || !settings.currency || !settings.timezone) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      
      const response = await fetch('http://localhost:3333/settings', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar configurações');
      }

      const data = await response.json();
      setSettings(data.settings);
      setHasChanges(false);
      
      // Aplicar tema imediatamente
      if (data.settings.theme) {
        setTheme(data.settings.theme);
      }
      
      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preferências Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Preferências Gerais
            </CardTitle>
            <CardDescription>
              Configure idioma, tema e outras preferências
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt_BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select 
                value={theme || settings.theme} 
                onValueChange={(value) => {
                  setSettings({ ...settings, theme: value });
                  setTheme(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email de Contato</Label>
              <Input
                id="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure as preferências de notificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Receber notificações por email</Label>
                <p className="text-sm text-muted-foreground">
                  Ative para receber notificações importantes
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {settings.notifications ? 'Ativado' : 'Desativado'}
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, notifications: checked });
                  toast.success(`Notificações ${checked ? 'ativadas' : 'desativadas'}`);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Localização
            </CardTitle>
            <CardDescription>
              Configure moeda e fuso horário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo</SelectItem>
                  <SelectItem value="America/New_York">Nova York</SelectItem>
                  <SelectItem value="Europe/London">Londres</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configure as opções de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de dois fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {settings.twoFactor ? 'Ativado' : 'Desativado'}
                </p>
              </div>
              <Switch
                checked={settings.twoFactor}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, twoFactor: checked });
                  toast.success(`Autenticação de dois fatores ${checked ? 'ativada' : 'desativada'}`);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Logout automático</Label>
                <p className="text-sm text-muted-foreground">
                  Desconectar automaticamente após inatividade
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {settings.autoLogout ? 'Ativado' : 'Desativado'}
                </p>
              </div>
              <Switch
                checked={settings.autoLogout}
                onCheckedChange={(checked) => {
                  setSettings({ ...settings, autoLogout: checked });
                  toast.success(`Logout automático ${checked ? 'ativado' : 'desativado'}`);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                min="5"
                max="480"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityLevel">Nível de Segurança</Label>
              <Select value={settings.securityLevel} onValueChange={(value) => setSettings({ ...settings, securityLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !hasChanges}
          variant={hasChanges ? "default" : "outline"}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Salvando...' : hasChanges ? 'Salvar Alterações' : 'Salvo'}
        </Button>
      </div>
    </div>
  );
}