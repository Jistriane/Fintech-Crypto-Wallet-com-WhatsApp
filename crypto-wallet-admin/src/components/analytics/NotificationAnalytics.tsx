import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/common/LineChart';
import { BarChart } from '@/components/common/BarChart';
import { DonutChart } from '@/components/common/DonutChart';
import { NotificationAnalytics as NotificationAnalyticsType } from '@/types/analytics';

interface NotificationAnalyticsProps {
  data: NotificationAnalyticsType;
}

export function NotificationAnalytics({ data }: NotificationAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Total de Notificações</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.totalNotifications.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Taxa de Entrega</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {(data.deliveryRate * 100).toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Taxa de Resposta</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {(data.responseRate * 100).toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Notificações (24h)</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.notificationTrend[data.notificationTrend.length - 1].sent.toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tendência de Notificações">
          <div className="p-4">
            <LineChart
              data={data.notificationTrend}
              index="date"
              categories={['sent', 'delivered', 'responded']}
              dataKey="value"
              title="Notificações"
            />
          </div>
        </Card>

        <Card title="Notificações por Tipo">
          <div className="p-4">
            <BarChart
              data={data.notificationsByType}
              dataKey="count"
              category="type"
              title="Tipos"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tempo de Entrega">
          <div className="p-4">
            <DonutChart
              data={data.deliveryTime}
              category="count"
              dataKey="range"
              title="Tempo"
            />
          </div>
        </Card>

        <Card title="Motivos de Falha">
          <div className="p-4">
            <DonutChart
              data={data.failureReasons}
              category="count"
              dataKey="reason"
              title="Falhas"
            />
          </div>
        </Card>
      </div>

      <Card title="Desempenho por Tipo">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Entrega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Resposta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.notificationsByType.map((type) => (
                  <tr key={type.type}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {type.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {type.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(type.deliveryRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(type.responseRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
