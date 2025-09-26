import { create } from 'zustand';
import {
  DeFiState,
  SwapQuote,
  LiquidityPool,
  FarmingPool,
  AddLiquidityParams,
  RemoveLiquidityParams,
  StakeLPParams,
  UnstakeLPParams,
  ClaimRewardsParams,
} from '../types/defi';
import defiService from '../services/defiService';

interface DeFiStore extends DeFiState {
  loadAvailableTokens: () => Promise<void>;
  loadPopularPools: () => Promise<void>;
  loadUserPools: () => Promise<void>;
  loadFarmingPools: () => Promise<void>;
  loadPoolDetails: (poolId: string) => Promise<void>;
  loadFarmDetails: (farmId: string) => Promise<void>;
  getSwapQuote: (fromToken: string, toToken: string, amount: string) => Promise<SwapQuote>;
  executeSwap: (quote: SwapQuote) => Promise<string>;
  addLiquidity: (params: AddLiquidityParams) => Promise<string>;
  removeLiquidity: (params: RemoveLiquidityParams) => Promise<string>;
  stakeLPTokens: (params: StakeLPParams) => Promise<string>;
  unstakeLPTokens: (params: UnstakeLPParams) => Promise<string>;
  claimRewards: (params: ClaimRewardsParams) => Promise<string>;
  selectPool: (pool: LiquidityPool | null) => void;
  selectFarm: (farm: FarmingPool | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: DeFiState = {
  availableTokens: [],
  popularPools: [],
  userPools: [],
  farmingPools: [],
  selectedPool: null,
  selectedFarm: null,
  isLoading: false,
  error: null,
};

const useDeFiStore = create<DeFiStore>((set, get) => ({
  ...initialState,

  loadAvailableTokens: async () => {
    try {
      set({ isLoading: true, error: null });
      const tokens = await defiService.getAvailableTokens();
      set({
        availableTokens: tokens,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar tokens disponíveis',
      });
      throw error;
    }
  },

  loadPopularPools: async () => {
    try {
      set({ isLoading: true, error: null });
      const pools = await defiService.getLiquidityPools();
      set({
        popularPools: pools,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar pools populares',
      });
      throw error;
    }
  },

  loadUserPools: async () => {
    try {
      set({ isLoading: true, error: null });
      const pools = await defiService.getUserPools();
      set({
        userPools: pools,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar suas pools',
      });
      throw error;
    }
  },

  loadFarmingPools: async () => {
    try {
      set({ isLoading: true, error: null });
      const pools = await defiService.getFarmingPools();
      set({
        farmingPools: pools,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar pools de farming',
      });
      throw error;
    }
  },

  loadPoolDetails: async (poolId: string) => {
    try {
      set({ isLoading: true, error: null });
      const pool = await defiService.getPoolDetails(poolId);
      set({
        selectedPool: pool,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar detalhes da pool',
      });
      throw error;
    }
  },

  loadFarmDetails: async (farmId: string) => {
    try {
      set({ isLoading: true, error: null });
      const farm = await defiService.getFarmDetails(farmId);
      set({
        selectedFarm: farm,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar detalhes do farming',
      });
      throw error;
    }
  },

  getSwapQuote: async (fromToken: string, toToken: string, amount: string) => {
    try {
      set({ isLoading: true, error: null });
      const quote = await defiService.getSwapQuote(fromToken, toToken, amount);
      set({ isLoading: false });
      return quote;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao obter cotação',
      });
      throw error;
    }
  },

  executeSwap: async (quote: SwapQuote) => {
    try {
      set({ isLoading: true, error: null });
      const transactionHash = await defiService.executeSwap(quote);
      set({ isLoading: false });
      return transactionHash;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao executar swap',
      });
      throw error;
    }
  },

  addLiquidity: async (params: AddLiquidityParams) => {
    try {
      set({ isLoading: true, error: null });
      const transactionHash = await defiService.addLiquidity(params);
      await get().loadUserPools();
      set({ isLoading: false });
      return transactionHash;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao adicionar liquidez',
      });
      throw error;
    }
  },

  removeLiquidity: async (params: RemoveLiquidityParams) => {
    try {
      set({ isLoading: true, error: null });
      const transactionHash = await defiService.removeLiquidity(params);
      await get().loadUserPools();
      set({ isLoading: false });
      return transactionHash;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao remover liquidez',
      });
      throw error;
    }
  },

  stakeLPTokens: async (params: StakeLPParams) => {
    try {
      set({ isLoading: true, error: null });
      const transactionHash = await defiService.stakeLPTokens(params);
      await get().loadFarmingPools();
      set({ isLoading: false });
      return transactionHash;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer stake',
      });
      throw error;
    }
  },

  unstakeLPTokens: async (params: UnstakeLPParams) => {
    try {
      set({ isLoading: true, error: null });
      const transactionHash = await defiService.unstakeLPTokens(params);
      await get().loadFarmingPools();
      set({ isLoading: false });
      return transactionHash;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer unstake',
      });
      throw error;
    }
  },

  claimRewards: async (params: ClaimRewardsParams) => {
    try {
      set({ isLoading: true, error: null });
      const transactionHash = await defiService.claimRewards(params);
      await get().loadFarmingPools();
      set({ isLoading: false });
      return transactionHash;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao resgatar recompensas',
      });
      throw error;
    }
  },

  selectPool: (pool: LiquidityPool | null) => {
    set({ selectedPool: pool });
  },

  selectFarm: (farm: FarmingPool | null) => {
    set({ selectedFarm: farm });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useDeFiStore;
