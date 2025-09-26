import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { LineChart } from '@/components/common/LineChart';
import { TransactionStats } from '@/types/dashboard';

interface TransactionChartProps {
  stats: TransactionStats;
}

type Period = 'daily' | 'weekly' | 'monthly';

export function TransactionChart({ stats }: TransactionChartProps) {
  const [period, setPeriod] = useState<Period>('daily');

  const data = {
    daily: stats.daily,
    weekly: stats.weekly,
    monthly: stats.monthly,
  }[period];

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card title="Volume de Transações">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              period === 'daily'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Diário
          </button>
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 text-sm font-medium -ml-px ${
              period === 'weekly'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Semanal
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md -ml-px ${
              period === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Mensal
          </button>
        </div>
      </div>

      <LineChart
        data={data}
        xKey={period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month'}
        yKey="volume"
        formatY={formatValue}
        formatTooltip={formatValue}
        height={300}
      />
    </Card>
  );
}
