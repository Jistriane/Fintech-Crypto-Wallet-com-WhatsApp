import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/common/LineChart';
import { BarChart } from '@/components/common/BarChart';
import { DonutChart } from '@/components/common/DonutChart';
import { TransactionAnalytics as TransactionAnalyticsType } from '@/types/analytics';

interface TransactionAnalyticsProps {
  data: TransactionAnalyticsType;
}

export function TransactionAnalytics({ data }: TransactionAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Total de Transações</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.totalTransactions.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Volume Total</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              ${data.totalVolume.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Valor Médio</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              ${data.averageTransactionValue.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Taxa de Falha</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.failureRate[data.failureRate.length - 1].rate.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Volume de Transações">
          <div className="p-4">
            <LineChart
              data={data.transactionTrend}
              index="date"
              categories={['volume']}
              dataKey="volume"
              title="Volume"
            />
          </div>
        </Card>

        <Card title="Quantidade de Transações">
          <div className="p-4">
            <LineChart
              data={data.transactionTrend}
              index="date"
              categories={['count']}
              dataKey="count"
              title="Quantidade"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Transações por Tipo">
          <div className="p-4">
            <DonutChart
              data={data.transactionsByType}
              category="volume"
              dataKey="type"
              title="Tipos"
            />
          </div>
        </Card>

        <Card title="Transações por Rede">
          <div className="p-4">
            <BarChart
              data={data.transactionsByNetwork}
              dataKey="volume"
              category="network"
              title="Redes"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Taxa de Falha">
          <div className="p-4">
            <LineChart
              data={data.failureRate}
              index="date"
              categories={['rate']}
              dataKey="rate"
              title="Taxa de Falha"
            />
          </div>
        </Card>

        <Card title="Uso de Gas">
          <div className="p-4">
            <LineChart
              data={data.gasUsage}
              index="date"
              categories={['average', 'total']}
              dataKey="value"
              title="Gas"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
