'use client';

import { useState, useEffect } from 'react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { UserAnalytics } from '@/components/analytics/UserAnalytics';
import { TransactionAnalytics } from '@/components/analytics/TransactionAnalytics';
import { WalletAnalytics } from '@/components/analytics/WalletAnalytics';
import { LiquidityAnalytics } from '@/components/analytics/LiquidityAnalytics';
import { NotificationAnalytics } from '@/components/analytics/NotificationAnalytics';
import { SystemAnalytics } from '@/components/analytics/SystemAnalytics';

type AnalyticsTab =
  | 'users'
  | 'transactions'
  | 'wallets'
  | 'liquidity'
  | 'notifications'
  | 'system';

export default function AnalyticsPage() {
  const {
    data,
    userAnalytics,
    transactionAnalytics,
    walletAnalytics,
    liquidityAnalytics,
    notificationAnalytics,
    systemAnalytics,
    filters,
    isLoading,
    error,
    fetchAnalytics,
    fetchUserAnalytics,
    fetchTransactionAnalytics,
    fetchWalletAnalytics,
    fetchLiquidityAnalytics,
    fetchNotificationAnalytics,
    fetchSystemAnalytics,
    setFilters,
  } = useAnalyticsStore();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('users');

  useEffect(() => {
    const fetchData = async () => {
      switch (activeTab) {
        case 'users':
          await fetchUserAnalytics();
          break;
        case 'transactions':
          await fetchTransactionAnalytics();
          break;
        case 'wallets':
          await fetchWalletAnalytics();
          break;
        case 'liquidity':
          await fetchLiquidityAnalytics();
          break;
        case 'notifications':
          await fetchNotificationAnalytics();
          break;
        case 'system':
          await fetchSystemAnalytics();
          break;
      }
    };

    fetchData();
  }, [
    activeTab,
    filters,
    fetchUserAnalytics,
    fetchTransactionAnalytics,
    fetchWalletAnalytics,
    fetchLiquidityAnalytics,
    fetchNotificationAnalytics,
    fetchSystemAnalytics,
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      </div>

      <div className="space-y-6">
        <AnalyticsFilters filters={filters} onApplyFilters={setFilters} />

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`${
                activeTab === 'transactions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Transações
            </button>
            <button
              onClick={() => setActiveTab('wallets')}
              className={`${
                activeTab === 'wallets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Carteiras
            </button>
            <button
              onClick={() => setActiveTab('liquidity')}
              className={`${
                activeTab === 'liquidity'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Liquidez
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Notificações
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`${
                activeTab === 'system'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Sistema
            </button>
          </nav>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'users' && userAnalytics && (
              <UserAnalytics data={userAnalytics} />
            )}
            {activeTab === 'transactions' && transactionAnalytics && (
              <TransactionAnalytics data={transactionAnalytics} />
            )}
            {activeTab === 'wallets' && walletAnalytics && (
              <WalletAnalytics data={walletAnalytics} />
            )}
            {activeTab === 'liquidity' && liquidityAnalytics && (
              <LiquidityAnalytics data={liquidityAnalytics} />
            )}
            {activeTab === 'notifications' && notificationAnalytics && (
              <NotificationAnalytics data={notificationAnalytics} />
            )}
            {activeTab === 'system' && systemAnalytics && (
              <SystemAnalytics data={systemAnalytics} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
