'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@tremor/react';
import { MessageSquare, Send, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WhatsAppPage() {
  const [stats, setStats] = useState({
    activeChats: 0,
    messagesSent: 0,
    messagesReceived: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      // TODO: Implementar chamada real para API
      setStats({
        activeChats: 567,
        messagesSent: 12345,
        messagesReceived: 12789,
        successRate: 98.5,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
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
        <h1 className="text-3xl font-bold">WhatsApp</h1>
        <p className="text-muted-foreground">
          Monitore as interações via WhatsApp
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chats Ativos</p>
              <p className="mt-2 text-3xl font-bold">{stats.activeChats}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mensagens Enviadas</p>
              <p className="mt-2 text-3xl font-bold">{stats.messagesSent}</p>
            </div>
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mensagens Recebidas</p>
              <p className="mt-2 text-3xl font-bold">{stats.messagesReceived}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="mt-2 text-3xl font-bold">{stats.successRate}%</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Status dos Serviços</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Serviço</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Última Verificação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Conexão WhatsApp</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Ativo
                  </span>
                </TableCell>
                <TableCell>{new Date().toLocaleString('pt-BR')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Envio de Mensagens</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Ativo
                  </span>
                </TableCell>
                <TableCell>{new Date().toLocaleString('pt-BR')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Recebimento de Mensagens</TableCell>
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
    </div>
  );
}