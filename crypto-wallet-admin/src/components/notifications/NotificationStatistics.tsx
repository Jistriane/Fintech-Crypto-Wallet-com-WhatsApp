"use client"

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { notusService } from '@/services/notus'
import { toast } from '@/components/ui/use-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export function NotificationStatistics() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    deliveredMessages: 0,
    failedMessages: 0,
    messagesByTemplate: [],
    deliveryRates: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await notusService.getNotificationStats()
        setStats(data)
      } catch (err) {
        setError('Não foi possível carregar as estatísticas')
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as estatísticas',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div>Carregando estatísticas...</div>
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total de Mensagens</CardTitle>
          <CardDescription>Total enviado até agora</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.totalMessages}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens Entregues</CardTitle>
          <CardDescription>Entregues com sucesso</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{stats.deliveredMessages}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Falhas</CardTitle>
          <CardDescription>Mensagens não entregues</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{stats.failedMessages}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de Entrega</CardTitle>
          <CardDescription>Porcentagem de sucesso</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {stats.totalMessages > 0
              ? ((stats.deliveredMessages / stats.totalMessages) * 100).toFixed(1)
              : 0}
            %
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Mensagens por Template</CardTitle>
          <CardDescription>Distribuição de uso dos templates</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.messagesByTemplate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" name="Enviadas" fill="#4F46E5" />
              <Bar dataKey="delivered" name="Entregues" fill="#059669" />
              <Bar dataKey="failed" name="Falhas" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Taxa de Entrega ao Longo do Tempo</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.deliveryRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rate" name="Taxa de Entrega (%)" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}