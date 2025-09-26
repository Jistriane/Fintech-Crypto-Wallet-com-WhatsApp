import { Card } from '@/components/common/Card';
import { DonutChart } from '@/components/common/DonutChart';
import { DashboardStats } from '@/types/dashboard';

interface KYCDistributionProps {
  stats: DashboardStats;
}

export function KYCDistribution({ stats }: KYCDistributionProps) {
  const data = [
    { name: 'Nível 0', value: stats.kycStats.level0 },
    { name: 'Nível 1', value: stats.kycStats.level1 },
    { name: 'Nível 2', value: stats.kycStats.level2 },
    { name: 'Nível 3', value: stats.kycStats.level3 },
  ];

  const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa'];

  return (
    <Card title="Distribuição de KYC">
      <DonutChart
        data={data}
        colors={colors}
        height={300}
        formatValue={(value) => value.toLocaleString()}
      />
    </Card>
  );
}
