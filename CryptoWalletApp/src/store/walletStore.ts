import { create } from 'zustand';
import { WalletState, Wallet, Token, Transaction, SendTokenData, SwapTokenData, AddLiquidityData, RemoveLiquidityData } from '../types/wallet';
import walletService from '../services/walletService';

interface WalletStore extends WalletState {
  loadWallets: () => Promise<void>;
  loadWallet: (walletId: string) => Promise<void>;
  loadTokens: (walletId: string) => Promise<void>;
  loadToken: (walletId: string, tokenId: string) => Promise<void>;
  loadTransactions: (walletId: string) => Promise<void>;
  loadTransaction: (walletId: string, transactionId: string) => Promise<void>;
  sendToken: (data: SendTokenData) => Promise<void>;
  swapToken: (data: SwapTokenData) => Promise<void>;
  addLiquidity: (data: AddLiquidityData) => Promise<void>;
  removeLiquidity: (data: RemoveLiquidityData) => Promise<void>;
  selectWallet: (wallet: Wallet | null) => void;
  selectToken: (token: Token | null) => void;
  selectTransaction: (transaction: Transaction | null) => void;
  setError: (error: string | null) => void;
}

const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  selectedWallet: null,
  selectedToken: null,
  selectedTransaction: null,
  isLoading: false,
  error: null,

  loadWallets: async () => {
    try {
      set({ isLoading: true, error: null });
      const wallets = await walletService.getWallets();
      set({ wallets, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar carteiras',
      });
      throw error;
    }
  },

  loadWallet: async (walletId: string) => {
    try {
      set({ isLoading: true, error: null });
      const wallet = await walletService.getWallet(walletId);
      set((state) => ({
        wallets: state.wallets.map((w) => (w.id === wallet.id ? wallet : w)),
        selectedWallet: wallet,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar carteira',
      });
      throw error;
    }
  },

  loadTokens: async (walletId: string) => {
    try {
      set({ isLoading: true, error: null });
      const tokens = await walletService.getTokens(walletId);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === walletId ? { ...w, tokens } : w
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar tokens',
      });
      throw error;
    }
  },

  loadToken: async (walletId: string, tokenId: string) => {
    try {
      set({ isLoading: true, error: null });
      const token = await walletService.getToken(walletId, tokenId);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === walletId
            ? {
                ...w,
                tokens: w.tokens.map((t) => (t.id === token.id ? token : t)),
              }
            : w
        ),
        selectedToken: token,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar token',
      });
      throw error;
    }
  },

  loadTransactions: async (walletId: string) => {
    try {
      set({ isLoading: true, error: null });
      const transactions = await walletService.getTransactions(walletId);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === walletId ? { ...w, transactions } : w
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar transações',
      });
      throw error;
    }
  },

  loadTransaction: async (walletId: string, transactionId: string) => {
    try {
      set({ isLoading: true, error: null });
      const transaction = await walletService.getTransaction(walletId, transactionId);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === walletId
            ? {
                ...w,
                transactions: w.transactions.map((t) =>
                  t.id === transaction.id ? transaction : t
                ),
              }
            : w
        ),
        selectedTransaction: transaction,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar transação',
      });
      throw error;
    }
  },

  sendToken: async (data: SendTokenData) => {
    try {
      set({ isLoading: true, error: null });
      const transaction = await walletService.sendToken(data);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === data.walletId
            ? {
                ...w,
                transactions: [transaction, ...w.transactions],
              }
            : w
        ),
        selectedTransaction: transaction,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar token',
      });
      throw error;
    }
  },

  swapToken: async (data: SwapTokenData) => {
    try {
      set({ isLoading: true, error: null });
      const transaction = await walletService.swapToken(data);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === data.walletId
            ? {
                ...w,
                transactions: [transaction, ...w.transactions],
              }
            : w
        ),
        selectedTransaction: transaction,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao trocar tokens',
      });
      throw error;
    }
  },

  addLiquidity: async (data: AddLiquidityData) => {
    try {
      set({ isLoading: true, error: null });
      const transaction = await walletService.addLiquidity(data);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === data.walletId
            ? {
                ...w,
                transactions: [transaction, ...w.transactions],
              }
            : w
        ),
        selectedTransaction: transaction,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao adicionar liquidez',
      });
      throw error;
    }
  },

  removeLiquidity: async (data: RemoveLiquidityData) => {
    try {
      set({ isLoading: true, error: null });
      const transaction = await walletService.removeLiquidity(data);
      set((state) => ({
        wallets: state.wallets.map((w) =>
          w.id === data.walletId
            ? {
                ...w,
                transactions: [transaction, ...w.transactions],
              }
            : w
        ),
        selectedTransaction: transaction,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao remover liquidez',
      });
      throw error;
    }
  },

  selectWallet: (wallet) => set({ selectedWallet: wallet }),
  selectToken: (token) => set({ selectedToken: token }),
  selectTransaction: (transaction) => set({ selectedTransaction: transaction }),
  setError: (error) => set({ error }),
}));

export default useWalletStore;
