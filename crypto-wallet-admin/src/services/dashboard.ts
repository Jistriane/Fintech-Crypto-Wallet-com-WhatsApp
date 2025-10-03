import api from './api';
import type {
  DashboardMetrics,
  ChartData,
  TokenMetrics,
  NetworkMetrics,
  WhatsAppMetrics,
} from '@/types/dashboard';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data } = await api.get<DashboardMetrics>('/dashboard/metrics');
    return data;
  },

  async getChartData(period: 'day' | 'week' | 'month' = 'week'): Promise<ChartData[]> {
    const { data } = await api.get<ChartData[]>(`/dashboard/chart?period=${period}`);
    return data;
  },

  async getTokenMetrics(): Promise<TokenMetrics[]> {
    const { data } = await api.get<TokenMetrics[]>('/dashboard/tokens');
    return data;
  },

  async getNetworkMetrics(): Promise<NetworkMetrics[]> {
    const { data } = await api.get<NetworkMetrics[]>('/dashboard/networks');
    return data;
  },

  async getWhatsAppMetrics(): Promise<WhatsAppMetrics> {
    const { data } = await api.get<WhatsAppMetrics>('/dashboard/whatsapp');
    return data;
  },
};
