import { create } from 'zustand';
import {
  WalletState,
  SendTokenData,
  SwapTokenData,
  AddLiquidityData,
  RemoveLiquidityData,
  FarmData,
} from '@/types/wallet';
import WalletService from '@/services/walletService';

interface WalletStore extends WalletState {
  initialize: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  getTransactionDetails: (transactionId: string) => Promise<void>;
  sendToken: (data: SendTokenData) => Promise<void>;
  swapTokens: (data: SwapTokenData) => Promise<void>;
  addLiquidity: (data: AddLiquidityData) => Promise<void>;
  removeLiquidity: (data: RemoveLiquidityData) => Promise<void>;
  farm: (data: FarmData) => Promise<void>;
  clearError: () => void;
}

const walletService = WalletService.getInstance();

export const useWalletStore = create<WalletStore>((set, get) => ({
  address: '',
  network: '',
  balances: [],
  transactions: [],
  selectedTransaction: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [address, balances, transactions] = await Promise.all([
        walletService.getWalletAddress(),
        walletService.getTokenBalances(),
        walletService.getTransactions(),
      ]);
      set({
        address,
        balances,
        transactions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao inicializar carteira',
        isLoading: false,
      });
      throw error;
    }
  },

  refreshBalances: async () => {
    set({ isLoading: true, error: null });
    try {
      const balances = await walletService.getTokenBalances();
      set({ balances, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar saldos',
        isLoading: false,
      });
      throw error;
    }
  },

  loadMoreTransactions: async () => {
    const { transactions } = get();
    set({ isLoading: true, error: null });
    try {
      const page = Math.floor(transactions.length / 10) + 1;
      const newTransactions = await walletService.getTransactions(page);
      set({
        transactions: [...transactions, ...newTransactions],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao carregar mais transações',
        isLoading: false,
      });
      throw error;
    }
  },

  getTransactionDetails: async (transactionId) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await walletService.getTransactionById(transactionId);
      set({ selectedTransaction: transaction, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar detalhes da transação',
        isLoading: false,
      });
      throw error;
    }
  },

  sendToken: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await walletService.sendToken(data);
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao enviar token',
        isLoading: false,
      });
      throw error;
    }
  },

  swapTokens: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await walletService.swapTokens(data);
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao trocar tokens',
        isLoading: false,
      });
      throw error;
    }
  },

  addLiquidity: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await walletService.addLiquidity(data);
      set((state) => ({
        transactions: [transaction, ...state.transactions],
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
      const transaction = await walletService.removeLiquidity(data);
      set((state) => ({
        transactions: [transaction, ...state.transactions],
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

  farm: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await walletService.farm(data);
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao fazer farm',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
