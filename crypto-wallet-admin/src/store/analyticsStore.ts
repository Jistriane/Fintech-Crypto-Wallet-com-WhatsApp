import { create } from 'zustand';
import {
  AnalyticsFilters,
  AnalyticsData,
  UserAnalytics,
  TransactionAnalytics,
  WalletAnalytics,
  LiquidityAnalytics,
  NotificationAnalytics,
  SystemAnalytics,
} from '@/types/analytics';
import AnalyticsService from '@/services/analyticsService';

interface AnalyticsState {
  data: AnalyticsData | null;
  userAnalytics: UserAnalytics | null;
  transactionAnalytics: TransactionAnalytics | null;
  walletAnalytics: WalletAnalytics | null;
  liquidityAnalytics: LiquidityAnalytics | null;
  notificationAnalytics: NotificationAnalytics | null;
  systemAnalytics: SystemAnalytics | null;
  filters: AnalyticsFilters;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
  fetchUserAnalytics: () => Promise<void>;
  fetchTransactionAnalytics: () => Promise<void>;
  fetchWalletAnalytics: () => Promise<void>;
  fetchLiquidityAnalytics: () => Promise<void>;
  fetchNotificationAnalytics: () => Promise<void>;
  fetchSystemAnalytics: () => Promise<void>;
  setFilters: (filters: AnalyticsFilters) => void;
  clearError: () => void;
}

const analyticsService = AnalyticsService.getInstance();

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  data: null,
  userAnalytics: null,
  transactionAnalytics: null,
  walletAnalytics: null,
  liquidityAnalytics: null,
  notificationAnalytics: null,
  systemAnalytics: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchAnalytics: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getAnalytics(filters);
      set({ data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar analytics',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserAnalytics: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const userAnalytics = await analyticsService.getUserAnalytics(filters);
      set({ userAnalytics, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar analytics de usuários',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTransactionAnalytics: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const transactionAnalytics = await analyticsService.getTransactionAnalytics(filters);
      set({ transactionAnalytics, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar analytics de transações',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWalletAnalytics: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const walletAnalytics = await analyticsService.getWalletAnalytics(filters);
      set({ walletAnalytics, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar analytics de carteiras',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchLiquidityAnalytics: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const liquidityAnalytics = await analyticsService.getLiquidityAnalytics(filters);
      set({ liquidityAnalytics, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar analytics de liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchNotificationAnalytics: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const notificationAnalytics = await analyticsService.getNotificationAnalytics(filters);
      set({ notificationAnalytics, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar analytics de notificações',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchSystemAnalytics: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });
    try {
      const systemAnalytics = await analyticsService.getSystemAnalytics(filters);
      set({ systemAnalytics, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar analytics do sistema',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearError: () => set({ error: null }),
}));
