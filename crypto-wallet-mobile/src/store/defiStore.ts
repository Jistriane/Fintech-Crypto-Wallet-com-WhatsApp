import { create } from 'zustand';
import {
  DeFiState,
  SwapData,
  AddLiquidityData,
  RemoveLiquidityData,
  StakeData,
  UnstakeData,
  ClaimRewardsData,
} from '@/types/defi';
import DeFiService from '@/services/defiService';

interface DeFiStore extends DeFiState {
  initialize: () => Promise<void>;
  getSwapQuote: (
    fromToken: string,
    toToken: string,
    amount: string
  ) => Promise<void>;
  swap: (data: SwapData) => Promise<void>;
  getLiquidityPool: (poolId: string) => Promise<void>;
  addLiquidity: (data: AddLiquidityData) => Promise<void>;
  removeLiquidity: (data: RemoveLiquidityData) => Promise<void>;
  getFarm: (farmId: string) => Promise<void>;
  stake: (data: StakeData) => Promise<void>;
  unstake: (data: UnstakeData) => Promise<void>;
  claimRewards: (data: ClaimRewardsData) => Promise<void>;
  clearError: () => void;
}

const defiService = DeFiService.getInstance();

export const useDeFiStore = create<DeFiStore>((set) => ({
  pools: [],
  positions: [],
  farms: [],
  farmPositions: [],
  selectedPool: null,
  selectedFarm: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [pools, positions, farms, farmPositions] = await Promise.all([
        defiService.getLiquidityPools(),
        defiService.getLiquidityPositions(),
        defiService.getFarms(),
        defiService.getFarmPositions(),
      ]);
      set({
        pools,
        positions,
        farms,
        farmPositions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao inicializar DeFi',
        isLoading: false,
      });
      throw error;
    }
  },

  getSwapQuote: async (fromToken, toToken, amount) => {
    set({ isLoading: true, error: null });
    try {
      const quote = await defiService.getSwapQuote(fromToken, toToken, amount);
      set({ isLoading: false });
      return quote;
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao obter cotação',
        isLoading: false,
      });
      throw error;
    }
  },

  swap: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await defiService.swap(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao realizar swap',
        isLoading: false,
      });
      throw error;
    }
  },

  getLiquidityPool: async (poolId) => {
    set({ isLoading: true, error: null });
    try {
      const pool = await defiService.getLiquidityPool(poolId);
      set({ selectedPool: pool, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar pool',
        isLoading: false,
      });
      throw error;
    }
  },

  addLiquidity: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await defiService.addLiquidity(data);
      const [pools, positions] = await Promise.all([
        defiService.getLiquidityPools(),
        defiService.getLiquidityPositions(),
      ]);
      set({ pools, positions, isLoading: false });
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
      await defiService.removeLiquidity(data);
      const [pools, positions] = await Promise.all([
        defiService.getLiquidityPools(),
        defiService.getLiquidityPositions(),
      ]);
      set({ pools, positions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao remover liquidez',
        isLoading: false,
      });
      throw error;
    }
  },

  getFarm: async (farmId) => {
    set({ isLoading: true, error: null });
    try {
      const farm = await defiService.getFarm(farmId);
      set({ selectedFarm: farm, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar farm',
        isLoading: false,
      });
      throw error;
    }
  },

  stake: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await defiService.stake(data);
      const [farms, farmPositions] = await Promise.all([
        defiService.getFarms(),
        defiService.getFarmPositions(),
      ]);
      set({ farms, farmPositions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao fazer stake',
        isLoading: false,
      });
      throw error;
    }
  },

  unstake: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await defiService.unstake(data);
      const [farms, farmPositions] = await Promise.all([
        defiService.getFarms(),
        defiService.getFarmPositions(),
      ]);
      set({ farms, farmPositions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao fazer unstake',
        isLoading: false,
      });
      throw error;
    }
  },

  claimRewards: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await defiService.claimRewards(data);
      const [farms, farmPositions] = await Promise.all([
        defiService.getFarms(),
        defiService.getFarmPositions(),
      ]);
      set({ farms, farmPositions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao coletar recompensas',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
