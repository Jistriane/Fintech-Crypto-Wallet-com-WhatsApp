'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { KYCDistribution } from '@/components/dashboard/KYCDistribution';
import { NetworkDistribution } from '@/components/dashboard/NetworkDistribution';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { UserRegistrationChart } from '@/components/dashboard/UserRegistrationChart';
import { LiquidityPoolsTable } from '@/components/dashboard/LiquidityPoolsTable';

export default function DashboardPage() {
  const {
    stats,
    transactionStats,
    userStats,
    liquidityStats,
    isLoading,
    error,
    fetchStats,
    fetchTransactionStats,
    fetchUserStats,
    fetchLiquidityStats,
  } = useDashboardStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchStats(),
          fetchTransactionStats('daily'),
          fetchUserStats(),
          fetchLiquidityStats(),
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      }
    };

    loadData();
  }, [fetchStats, fetchTransactionStats, fetchUserStats, fetchLiquidityStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || !transactionStats || !userStats || !liquidityStats) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="space-y-8">
        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <KYCDistribution stats={stats} />
          <NetworkDistribution stats={stats} />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <TransactionChart stats={transactionStats} />
          <UserRegistrationChart stats={userStats} />
          <LiquidityPoolsTable stats={liquidityStats} />
        </div>
      </div>
    </div>
  );
}