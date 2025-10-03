import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppVerification } from '@/components/notifications/WhatsAppVerification';
import { TemplateMessage } from '@/components/notifications/TemplateMessage';
import { NotificationStatistics } from '@/components/notifications/NotificationStatistics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { notusService } from '@/services/notus';

export default function NotificationsPage() {
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gerenciamento de Notificações</h1>

      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">Enviar Mensagens</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          {!verifiedPhone ? (
            <Card>
              <CardHeader>
                <CardTitle>Verificar WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <WhatsAppVerification onVerified={setVerifiedPhone} />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm">
                  Número verificado: <strong>{verifiedPhone}</strong>
                </p>
                <Button variant="outline" onClick={() => setVerifiedPhone(null)}>
                  Alterar número
                </Button>
              </div>
              <TemplateMessage phone={verifiedPhone} />
            </>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <NotificationStatistics />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <ConfiguracaoNotificacoes />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConfiguracaoNotificacoes() {
  const [settings, setSettings] = useState({
    enabled: true,
    defaultLanguage: 'pt_BR',
    templates: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      await notusService.updateNotificationSettings({
        ...settings,
        enabled,
      });
      setSettings(prev => ({ ...prev, enabled }));
      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    try {
      setIsLoading(true);
      await notusService.updateNotificationSettings({
        ...settings,
        defaultLanguage: language,
      });
      setSettings(prev => ({ ...prev, defaultLanguage: language }));
      toast({
        title: 'Sucesso',
        description: 'Idioma atualizado com sucesso',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o idioma',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Status das Notificações</p>
          <p className="text-sm text-gray-500">
            Habilitar/desabilitar todas as notificações
          </p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Idioma Padrão</Label>
        <Select
          value={settings.defaultLanguage}
          onValueChange={handleLanguageChange}
          disabled={isLoading}
        >
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
    </div>
  );
}