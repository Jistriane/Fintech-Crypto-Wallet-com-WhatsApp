import api from './api';
import type {
  Wallet,
  WalletTransaction,
  WalletStats,
  WalletFilters,
} from '@/types/wallet';

export const walletService = {
  async getWallets(
    page = 1,
    limit = 10,
    filters?: WalletFilters
  ): Promise<{ wallets: Wallet[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const { data } = await api.get(`/wallets?${params}`);
    return data;
  },

  async getWallet(id: string): Promise<Wallet> {
    const { data } = await api.get(`/wallets/${id}`);
    return data;
  },

  async getWalletTransactions(
    walletId: string,
    page = 1,
    limit = 10
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const { data } = await api.get(
      `/wallets/${walletId}/transactions?page=${page}&limit=${limit}`
    );
    return data;
  },

  async getWalletStats(): Promise<WalletStats> {
    const { data } = await api.get('/wallets/stats');
    return data;
  },

  async blockWallet(id: string): Promise<void> {
    await api.post(`/wallets/${id}/block`);
  },

  async unblockWallet(id: string): Promise<void> {
    await api.post(`/wallets/${id}/unblock`);
  },

  async getWalletBalance(address: string, network: string): Promise<{
    native: string;
    usd: number;
    tokens: {
      [symbol: string]: {
        balance: string;
        usdValue: number;
      };
    };
  }> {
    const { data } = await api.get(`/wallets/${address}/balance?network=${network}`);
    return data;
  },

  async refreshWalletBalance(id: string): Promise<void> {
    await api.post(`/wallets/${id}/refresh-balance`);
  },

  async exportWalletTransactions(
    walletId: string,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const { data } = await api.get(
      `/wallets/${walletId}/transactions/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );
    return data;
  },
};
