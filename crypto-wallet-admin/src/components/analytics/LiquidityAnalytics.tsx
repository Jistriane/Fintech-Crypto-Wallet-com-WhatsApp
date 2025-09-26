import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/common/LineChart';
import { BarChart } from '@/components/common/BarChart';
import { DonutChart } from '@/components/common/DonutChart';
import { LiquidityAnalytics as LiquidityAnalyticsType } from '@/types/analytics';

interface LiquidityAnalyticsProps {
  data: LiquidityAnalyticsType;
}

export function LiquidityAnalytics({ data }: LiquidityAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Liquidez Total</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              ${data.totalLiquidity.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Total de Pools</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.totalPools.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Volume 24h</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              ${data.liquidityTrend[data.liquidityTrend.length - 1].volume.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">APY Médio</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {data.topPools.reduce((acc, pool) => acc + pool.apy, 0) / data.topPools.length}%
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tendência de Liquidez">
          <div className="p-4">
            <LineChart
              data={data.liquidityTrend}
              index="date"
              categories={['liquidity']}
              dataKey="liquidity"
              title="Liquidez"
            />
          </div>
        </Card>

        <Card title="Volume de Negociação">
          <div className="p-4">
            <LineChart
              data={data.liquidityTrend}
              index="date"
              categories={['volume']}
              dataKey="volume"
              title="Volume"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Pools por Rede">
          <div className="p-4">
            <BarChart
              data={data.poolsByNetwork}
              dataKey="liquidity"
              category="network"
              title="Redes"
            />
          </div>
        </Card>

        <Card title="Distribuição de APY">
          <div className="p-4">
            <DonutChart
              data={data.apyDistribution}
              category="count"
              dataKey="range"
              title="APY"
            />
          </div>
        </Card>
      </div>

      <Card title="Top Pools">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pool
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liquidez
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume 24h
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    APY
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topPools.map((pool) => (
                  <tr key={pool.pool}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pool.pool}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pool.liquidity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pool.volume24h.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pool.apy.toFixed(2)}%
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
