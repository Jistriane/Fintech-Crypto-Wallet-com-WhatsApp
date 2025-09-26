import { create } from 'zustand';
import {
  Transaction,
  TransactionFilters,
  TransactionSort,
  TransactionPagination,
  TransactionStats,
  TransactionDetails,
} from '@/types/transactions';
import TransactionService from '@/services/transactionService';

interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: TransactionDetails | null;
  transactionStats: TransactionStats | null;
  filters: TransactionFilters;
  sort: TransactionSort;
  pagination: TransactionPagination;
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  fetchTransactionById: (transactionId: string) => Promise<void>;
  fetchTransactionStats: () => Promise<void>;
  fetchTransactionsByWallet: (walletId: string) => Promise<void>;
  fetchTransactionsByUser: (userId: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  setSort: (sort: TransactionSort) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

const transactionService = TransactionService.getInstance();

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  selectedTransaction: null,
  transactionStats: null,
  filters: {},
  sort: { field: 'timestamp', direction: 'desc' },
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await transactionService.getTransactions(
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        transactions: response.transactions,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar transações',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTransactionById: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await transactionService.getTransactionById(transactionId);
      set({ selectedTransaction: transaction, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar transação',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTransactionStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await transactionService.getTransactionStats();
      set({ transactionStats: stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de transações',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTransactionsByWallet: async (walletId) => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await transactionService.getTransactionsByWallet(
        walletId,
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        transactions: response.transactions,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar transações da carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTransactionsByUser: async (userId) => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await transactionService.getTransactionsByUser(
        userId,
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        transactions: response.transactions,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar transações do usuário',
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
