import api from './api';
import type {
  Token,
  TokenTransaction,
  TokenStats,
  TokenFilters,
} from '@/types/token';

export const tokenService = {
  async getTokens(
    page = 1,
    limit = 10,
    filters?: TokenFilters
  ): Promise<{ tokens: Token[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const { data } = await api.get(`/tokens?${params}`);
    return data;
  },

  async getToken(id: string): Promise<Token> {
    const { data } = await api.get(`/tokens/${id}`);
    return data;
  },

  async getTokenTransactions(
    tokenId: string,
    page = 1,
    limit = 10
  ): Promise<{ transactions: TokenTransaction[]; total: number }> {
    const { data } = await api.get(
      `/tokens/${tokenId}/transactions?page=${page}&limit=${limit}`
    );
    return data;
  },

  async getTokenStats(): Promise<TokenStats> {
    const { data } = await api.get('/tokens/stats');
    return data;
  },

  async blockToken(id: string): Promise<void> {
    await api.post(`/tokens/${id}/block`);
  },

  async unblockToken(id: string): Promise<void> {
    await api.post(`/tokens/${id}/unblock`);
  },

  async getTokenPrice(address: string, network: string): Promise<{
    usd: number;
    brl: number;
    change24h: number;
  }> {
    const { data } = await api.get(
      `/tokens/${address}/price?network=${network}`
    );
    return data;
  },

  async refreshTokenPrice(id: string): Promise<void> {
    await api.post(`/tokens/${id}/refresh-price`);
  },

  async getTokenHolders(
    tokenId: string,
    page = 1,
    limit = 10
  ): Promise<{
    holders: Array<{
      address: string;
      balance: string;
      usdValue: number;
      percentage: number;
    }>;
    total: number;
  }> {
    const { data } = await api.get(
      `/tokens/${tokenId}/holders?page=${page}&limit=${limit}`
    );
    return data;
  },

  async exportTokenTransactions(
    tokenId: string,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const { data } = await api.get(
      `/tokens/${tokenId}/transactions/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );
    return data;
  },

  async getTokenMetrics(
    tokenId: string,
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<Array<{
    timestamp: string;
    price: number;
    volume: number;
    transactions: number;
  }>> {
    const { data } = await api.get(
      `/tokens/${tokenId}/metrics?period=${period}`
    );
    return data;
  },
};
