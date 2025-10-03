'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SecurityPage() {
  const { address } = useAccount();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [backupCreated, setBackupCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnableTwoFactor = async () => {
    setLoading(true);
    try {
      // Aqui seria implementada a lógica real de 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(true);
    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWhatsapp = async () => {
    setLoading(true);
    try {
      // Aqui seria implementada a lógica real de verificação do WhatsApp
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWhatsappVerified(true);
    } catch (error) {
      console.error('Erro ao verificar WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      // Aqui seria implementada a lógica real de backup da carteira
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackupCreated(true);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Carteira não conectada</CardTitle>
            <CardDescription>
              Por favor, conecte sua carteira para acessar as configurações de segurança.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              A autenticação de dois fatores ajuda a proteger sua conta mesmo que sua senha seja comprometida.
            </p>
            <button
              onClick={handleEnableTwoFactor}
              disabled={loading || twoFactorEnabled}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                twoFactorEnabled
                  ? 'bg-green-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {twoFactorEnabled ? '2FA Ativado' : '2FA Desativado'}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verificação de WhatsApp</CardTitle>
          <CardDescription>
            Vincule seu número de WhatsApp para recuperação de conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              A verificação por WhatsApp permite recuperar sua conta e receber notificações de segurança.
            </p>
            <button
              onClick={handleVerifyWhatsapp}
              disabled={loading || whatsappVerified}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                whatsappVerified
                  ? 'bg-green-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {whatsappVerified ? 'WhatsApp Verificado' : 'Verificar WhatsApp'}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup da Carteira</CardTitle>
          <CardDescription>
            Faça backup seguro da sua carteira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Mantenha sua carteira segura criando um backup criptografado.
            </p>
            <button
              onClick={handleCreateBackup}
              disabled={loading || backupCreated}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                backupCreated
                  ? 'bg-green-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {backupCreated ? 'Backup Criado' : 'Criar Backup'}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Conectados</CardTitle>
          <CardDescription>
            Gerencie os dispositivos que têm acesso à sua carteira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Este dispositivo</div>
                <div className="text-sm text-gray-500">
                  Último acesso: {new Date().toLocaleString()}
                </div>
              </div>
              <button
                className="text-red-500 hover:text-red-600"
                onClick={() => {
                  // Implementar lógica de revogação de acesso
                }}
              >
                Revogar acesso
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
