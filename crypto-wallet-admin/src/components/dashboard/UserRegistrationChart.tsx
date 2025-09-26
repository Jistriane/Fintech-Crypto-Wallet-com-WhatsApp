import { Card } from '@/components/common/Card';
import { BarChart } from '@/components/common/BarChart';
import { UserStats } from '@/types/dashboard';

interface UserRegistrationChartProps {
  stats: UserStats;
}

export function UserRegistrationChart({ stats }: UserRegistrationChartProps) {
  return (
    <Card title="Novos Usuários">
      <BarChart
        data={stats.registrations}
        xKey="date"
        yKey="count"
        formatY={(value) => value.toLocaleString()}
        formatTooltip={(value) => `${value.toLocaleString()} usuários`}
        height={300}
        color="#10b981"
      />
    </Card>
  );
}
