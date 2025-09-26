import { create } from 'zustand';
import {
  DashboardStats,
  TransactionStats,
  UserStats,
  WalletStats,
  LiquidityStats,
  NotificationStats,
} from '@/types/dashboard';
import DashboardService from '@/services/dashboardService';

interface DashboardState {
  stats: DashboardStats | null;
  transactionStats: TransactionStats | null;
  userStats: UserStats | null;
  walletStats: WalletStats | null;
  liquidityStats: LiquidityStats | null;
  notificationStats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchTransactionStats: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  fetchUserStats: () => Promise<void>;
  fetchWalletStats: () => Promise<void>;
  fetchLiquidityStats: () => Promise<void>;
  fetchNotificationStats: () => Promise<void>;
  clearError: () => void;
}

const dashboardService = DashboardService.getInstance();

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  transactionStats: null,
  userStats: null,
  walletStats: null,
  liquidityStats: null,
  notificationStats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await dashboardService.getStats();
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTransactionStats: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const transactionStats = await dashboardService.getTransactionStats(period);
      set({ transactionStats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de transações',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const userStats = await dashboardService.getUserStats();
      set({ userStats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de usuários',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWalletStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const walletStats = await dashboardService.getWalletStats();
      set({ walletStats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de carteiras',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchLiquidityStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const liquidityStats = await dashboardService.getLiquidityStats();
      set({ liquidityStats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchNotificationStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const notificationStats = await dashboardService.getNotificationStats();
      set({ notificationStats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de notificações',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
