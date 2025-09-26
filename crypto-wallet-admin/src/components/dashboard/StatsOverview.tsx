import { UsersIcon, WalletIcon, ArrowsRightLeftIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { StatCard } from '@/components/common/StatCard';
import { DashboardStats } from '@/types/dashboard';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Usuários"
        value={stats.totalUsers.toLocaleString()}
        description={`${stats.activeUsers.toLocaleString()} usuários ativos`}
        icon={<UsersIcon className="h-6 w-6 text-primary-600" />}
      />
      <StatCard
        title="Total de Carteiras"
        value={stats.totalWallets.toLocaleString()}
        description="Carteiras criadas"
        icon={<WalletIcon className="h-6 w-6 text-primary-600" />}
      />
      <StatCard
        title="Total de Transações"
        value={stats.totalTransactions.toLocaleString()}
        description="Transações processadas"
        icon={<ArrowsRightLeftIcon className="h-6 w-6 text-primary-600" />}
      />
      <StatCard
        title="Volume Total"
        value={`$${stats.totalVolume.toLocaleString()}`}
        description="Volume em USD"
        icon={<BanknotesIcon className="h-6 w-6 text-primary-600" />}
      />
    </div>
  );
}
