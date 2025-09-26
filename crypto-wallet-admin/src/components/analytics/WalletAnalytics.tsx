import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/common/LineChart';
import { BarChart } from '@/components/common/BarChart';
import { DonutChart } from '@/components/common/DonutChart';
import { WalletAnalytics as WalletAnalyticsType } from '@/types/analytics';

interface WalletAnalyticsProps {
  data: WalletAnalyticsType;
}

export function WalletAnalytics({ data }: WalletAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Total de Carteiras</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.totalWallets.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Carteiras Ativas</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.activeWallets.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Taxa de Atividade</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {((data.activeWallets / data.totalWallets) * 100).toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Novas Carteiras (24h)</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.walletCreationTrend[data.walletCreationTrend.length - 1].count.toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Criação de Carteiras">
          <div className="p-4">
            <LineChart
              data={data.walletCreationTrend}
              index="date"
              categories={['count']}
              dataKey="count"
              title="Novas Carteiras"
            />
          </div>
        </Card>

        <Card title="Carteiras por Rede">
          <div className="p-4">
            <BarChart
              data={data.walletsByNetwork}
              dataKey="count"
              category="network"
              title="Redes"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Distribuição de Saldo">
          <div className="p-4">
            <DonutChart
              data={data.balanceDistribution}
              category="totalBalance"
              dataKey="range"
              title="Saldos"
            />
          </div>
        </Card>

        <Card title="Distribuição de Atividade">
          <div className="p-4">
            <DonutChart
              data={data.activityDistribution}
              category="count"
              dataKey="range"
              title="Atividade"
            />
          </div>
        </Card>
      </div>

      <Card title="Distribuição de Tokens">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.tokenDistribution.map((token) => (
                  <tr key={token.token}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {token.token}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {token.holders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {token.totalBalance.toLocaleString()}
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
