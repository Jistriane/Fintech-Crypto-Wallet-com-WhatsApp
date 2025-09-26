import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/common/LineChart';
import { SystemAnalytics as SystemAnalyticsType } from '@/types/analytics';

interface SystemAnalyticsProps {
  data: SystemAnalyticsType;
}

export function SystemAnalytics({ data }: SystemAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Requisições (24h)">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Requisições (24h)</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.apiUsage[data.apiUsage.length - 1].requests.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card title="Taxa de Erro">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Taxa de Erro</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.errorRate[data.errorRate.length - 1].rate.toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card title="Tempo de Resposta">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Tempo de Resposta</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.responseTime[data.responseTime.length - 1].average.toFixed(0)}ms
            </p>
          </div>
        </Card>

        <Card title="Uso de CPU">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Uso de CPU</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.resourceUsage[data.resourceUsage.length - 1].cpu.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Uso da API">
          <div className="p-4">
            <LineChart
              data={[
                ...data.apiUsage.map((item) => ({
                  date: item.date,
                  value: item.requests,
                  type: 'requests',
                })),
                ...data.apiUsage.map((item) => ({
                  date: item.date,
                  value: item.errors,
                  type: 'errors',
                })),
              ]}
              dataKey="value"
              title="API"
            />
          </div>
        </Card>

        <Card title="Tempo de Resposta">
          <div className="p-4">
            <LineChart
              data={[
                ...data.responseTime.map((item) => ({
                  date: item.date,
                  value: item.average,
                  type: 'average',
                })),
                ...data.responseTime.map((item) => ({
                  date: item.date,
                  value: item.p95,
                  type: 'p95',
                })),
                ...data.responseTime.map((item) => ({
                  date: item.date,
                  value: item.p99,
                  type: 'p99',
                })),
              ]}
              dataKey="value"
              title="Latência"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Taxa de Erro">
          <div className="p-4">
            <LineChart
              data={data.errorRate.map((item) => ({
                date: item.date,
                value: item.rate,
                type: 'rate',
              }))}
              dataKey="value"
              title="Erros"
            />
          </div>
        </Card>

        <Card title="Uso de Recursos">
          <div className="p-4">
            <LineChart
              data={[
                ...data.resourceUsage.map((item) => ({
                  date: item.date,
                  value: item.cpu,
                  type: 'cpu',
                })),
                ...data.resourceUsage.map((item) => ({
                  date: item.date,
                  value: item.memory,
                  type: 'memory',
                })),
                ...data.resourceUsage.map((item) => ({
                  date: item.date,
                  value: item.storage,
                  type: 'storage',
                })),
              ]}
              dataKey="value"
              title="Recursos"
            />
          </div>
        </Card>
      </div>

      <Card title="Uso de Rede">
        <div className="p-4">
          <LineChart
            data={[
              ...data.networkUsage.map((item) => ({
                date: item.date,
                value: item.inbound,
                type: 'inbound',
              })),
              ...data.networkUsage.map((item) => ({
                date: item.date,
                value: item.outbound,
                type: 'outbound',
              })),
            ]}
            dataKey="value"
            title="Rede"
          />
        </div>
      </Card>
    </div>
  );
}