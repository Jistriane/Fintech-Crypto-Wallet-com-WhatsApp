import { Card } from '@/components/common/Card';
import { DonutChart } from '@/components/common/DonutChart';
import { DashboardStats } from '@/types/dashboard';

interface NetworkDistributionProps {
  stats: DashboardStats;
}

export function NetworkDistribution({ stats }: NetworkDistributionProps) {
  const data = [
    { name: 'Ethereum', value: stats.networkStats.ethereum },
    { name: 'Polygon', value: stats.networkStats.polygon },
    { name: 'BSC', value: stats.networkStats.bsc },
    { name: 'Arbitrum', value: stats.networkStats.arbitrum },
  ];

  const colors = ['#627eea', '#8247e5', '#f3ba2f', '#28a0f0'];

  return (
    <Card title="Distribuição por Rede">
      <DonutChart
        data={data}
        colors={colors}
        height={300}
        formatValue={(value) => value.toLocaleString()}
      />
    </Card>
  );
}
