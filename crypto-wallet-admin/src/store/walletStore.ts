import { create } from 'zustand';
import {
  Wallet,
  TokenBalance,
  WalletTransaction,
  WalletFilters,
  WalletSort,
  WalletPagination,
  WalletStats,
  WalletActivity,
  CreateWalletData,
  UpdateWalletData,
} from '@/types/wallets';
import WalletService from '@/services/walletService';

interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  walletBalances: TokenBalance[];
  walletTransactions: WalletTransaction[];
  walletActivity: WalletActivity[];
  walletStats: WalletStats | null;
  filters: WalletFilters;
  sort: WalletSort;
  pagination: WalletPagination;
  isLoading: boolean;
  error: string | null;
  fetchWallets: () => Promise<void>;
  fetchWalletById: (walletId: string) => Promise<void>;
  fetchWalletBalances: (walletId: string) => Promise<void>;
  fetchWalletTransactions: (walletId: string) => Promise<void>;
  fetchWalletActivity: (walletId: string) => Promise<void>;
  fetchWalletStats: () => Promise<void>;
  createWallet: (data: CreateWalletData) => Promise<void>;
  updateWallet: (walletId: string, data: UpdateWalletData) => Promise<void>;
  setFilters: (filters: WalletFilters) => void;
  setSort: (sort: WalletSort) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

const walletService = WalletService.getInstance();

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  selectedWallet: null,
  walletBalances: [],
  walletTransactions: [],
  walletActivity: [],
  walletStats: null,
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,

  fetchWallets: async () => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await walletService.getWallets(
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        wallets: response.wallets,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar carteiras',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWalletById: async (walletId) => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await walletService.getWalletById(walletId);
      set({ selectedWallet: wallet, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWalletBalances: async (walletId) => {
    set({ isLoading: true, error: null });
    try {
      const balances = await walletService.getWalletBalances(walletId);
      set({ walletBalances: balances, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar saldos da carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWalletTransactions: async (walletId) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await walletService.getWalletTransactions(walletId);
      set({ walletTransactions: transactions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar transações da carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWalletActivity: async (walletId) => {
    set({ isLoading: true, error: null });
    try {
      const activity = await walletService.getWalletActivity(walletId);
      set({ walletActivity: activity, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar atividade da carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWalletStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await walletService.getWalletStats();
      set({ walletStats: stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de carteiras',
        isLoading: false,
      });
      throw error;
    }
  },

  createWallet: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await walletService.createWallet(data);
      await get().fetchWallets();
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao criar carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  updateWallet: async (walletId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedWallet = await walletService.updateWallet(walletId, data);
      set((state) => ({
        wallets: state.wallets.map((wallet) =>
          wallet.id === walletId ? updatedWallet : wallet
        ),
        selectedWallet: updatedWallet,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
  },

  setSort: (sort) => {
    set({ sort });
  },

  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
  },

  clearError: () => set({ error: null }),
}));
