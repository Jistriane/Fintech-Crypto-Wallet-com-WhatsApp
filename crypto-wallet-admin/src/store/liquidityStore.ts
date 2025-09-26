import { create } from 'zustand';
import {
  LiquidityPool,
  LiquidityPosition,
  LiquidityTransaction,
  LiquidityFilters,
  LiquiditySort,
  LiquidityPagination,
  LiquidityPoolDetails,
  AddLiquidityData,
  RemoveLiquidityData,
  CollectFeesData,
} from '@/types/liquidity';
import LiquidityService from '@/services/liquidityService';

interface LiquidityState {
  pools: LiquidityPool[];
  selectedPool: LiquidityPoolDetails | null;
  positions: LiquidityPosition[];
  transactions: LiquidityTransaction[];
  filters: LiquidityFilters;
  sort: LiquiditySort;
  pagination: LiquidityPagination;
  isLoading: boolean;
  error: string | null;
  fetchLiquidityPools: () => Promise<void>;
  fetchLiquidityPoolById: (poolId: string) => Promise<void>;
  fetchLiquidityPositions: (userId?: string, poolId?: string) => Promise<void>;
  fetchLiquidityTransactions: (userId?: string, poolId?: string) => Promise<void>;
  addLiquidity: (data: AddLiquidityData) => Promise<void>;
  removeLiquidity: (data: RemoveLiquidityData) => Promise<void>;
  collectFees: (data: CollectFeesData) => Promise<void>;
  setFilters: (filters: LiquidityFilters) => void;
  setSort: (sort: LiquiditySort) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

const liquidityService = LiquidityService.getInstance();

export const useLiquidityStore = create<LiquidityState>((set, get) => ({
  pools: [],
  selectedPool: null,
  positions: [],
  transactions: [],
  filters: {},
  sort: { field: 'tvl', direction: 'desc' },
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,

  fetchLiquidityPools: async () => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await liquidityService.getLiquidityPools(
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        pools: response.pools,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar pools de liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchLiquidityPoolById: async (poolId) => {
    set({ isLoading: true, error: null });
    try {
      const pool = await liquidityService.getLiquidityPoolById(poolId);
      set({ selectedPool: pool, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar pool de liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchLiquidityPositions: async (userId, poolId) => {
    const { pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await liquidityService.getLiquidityPositions(
        userId,
        poolId,
        pagination.page,
        pagination.limit
      );
      set({
        positions: response.positions,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar posições de liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchLiquidityTransactions: async (userId, poolId) => {
    const { pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await liquidityService.getLiquidityTransactions(
        userId,
        poolId,
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
        error: error.message || 'Falha ao buscar transações de liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  addLiquidity: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPool = await liquidityService.addLiquidity(data);
      set((state) => ({
        pools: state.pools.map((pool) =>
          pool.id === updatedPool.id ? updatedPool : pool
        ),
        selectedPool: state.selectedPool
          ? { ...state.selectedPool, pool: updatedPool }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao adicionar liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  removeLiquidity: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPool = await liquidityService.removeLiquidity(data);
      set((state) => ({
        pools: state.pools.map((pool) =>
          pool.id === updatedPool.id ? updatedPool : pool
        ),
        selectedPool: state.selectedPool
          ? { ...state.selectedPool, pool: updatedPool }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao remover liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  collectFees: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPool = await liquidityService.collectFees(data);
      set((state) => ({
        pools: state.pools.map((pool) =>
          pool.id === updatedPool.id ? updatedPool : pool
        ),
        selectedPool: state.selectedPool
          ? { ...state.selectedPool, pool: updatedPool }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao coletar taxas',
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
