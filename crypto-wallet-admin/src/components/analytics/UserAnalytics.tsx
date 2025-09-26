import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/common/LineChart';
import { BarChart } from '@/components/common/BarChart';
import { DonutChart } from '@/components/common/DonutChart';
import { UserAnalytics as UserAnalyticsType } from '@/types/analytics';

interface UserAnalyticsProps {
  data: UserAnalyticsType;
}

export function UserAnalytics({ data }: UserAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Total de Usuários</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.totalUsers.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Usuários Ativos</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.activeUsers.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Taxa de Retenção</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.retentionRate[data.retentionRate.length - 1].rate.toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Novos Usuários (24h)</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.userActivity[data.userActivity.length - 1].newUsers.toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Registros por Período">
          <div className="p-4">
            <LineChart
              data={data.registrationTrend}
              index="date"
              categories={['count']}
              dataKey="count"
              title="Registros"
            />
          </div>
        </Card>

        <Card title="Taxa de Retenção">
          <div className="p-4">
            <LineChart
              data={data.retentionRate}
              index="date"
              categories={['rate']}
              dataKey="rate"
              title="Retenção"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Distribuição de KYC">
          <div className="p-4">
            <DonutChart
              data={data.kycDistribution}
              category="count"
              dataKey="level"
              title="Níveis de KYC"
            />
          </div>
        </Card>

        <Card title="Usuários por Rede">
          <div className="p-4">
            <BarChart
              data={data.usersByNetwork}
              dataKey="count"
              category="network"
              title="Redes"
            />
          </div>
        </Card>
      </div>

      <Card title="Atividade de Usuários">
        <div className="p-4">
          <LineChart
            data={data.userActivity}
            index="date"
            categories={['activeUsers', 'newUsers', 'churned']}
            dataKey="value"
            title="Atividade"
          />
        </div>
      </Card>
    </div>
  );
}
