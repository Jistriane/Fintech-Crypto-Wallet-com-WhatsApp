import { create } from 'zustand';
import {
  KYCRequest,
  KYCFilters,
  KYCSort,
  KYCPagination,
  KYCStats,
  KYCDetails,
  UpdateKYCRequestData,
  UpdateKYCDocumentData,
} from '@/types/kyc';
import KYCService from '@/services/kycService';

interface KYCState {
  requests: KYCRequest[];
  selectedRequest: KYCDetails | null;
  kycStats: KYCStats | null;
  filters: KYCFilters;
  sort: KYCSort;
  pagination: KYCPagination;
  isLoading: boolean;
  error: string | null;
  fetchKYCRequests: () => Promise<void>;
  fetchKYCRequestById: (requestId: string) => Promise<void>;
  fetchKYCStats: () => Promise<void>;
  fetchKYCRequestsByUser: (userId: string) => Promise<void>;
  updateKYCRequest: (requestId: string, data: UpdateKYCRequestData) => Promise<void>;
  updateKYCDocument: (
    requestId: string,
    documentId: string,
    data: UpdateKYCDocumentData
  ) => Promise<void>;
  setFilters: (filters: KYCFilters) => void;
  setSort: (sort: KYCSort) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

const kycService = KYCService.getInstance();

export const useKYCStore = create<KYCState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  kycStats: null,
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,

  fetchKYCRequests: async () => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await kycService.getKYCRequests(
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        requests: response.requests,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar solicitações de KYC',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchKYCRequestById: async (requestId) => {
    set({ isLoading: true, error: null });
    try {
      const request = await kycService.getKYCRequestById(requestId);
      set({ selectedRequest: request, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar solicitação de KYC',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchKYCStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await kycService.getKYCStats();
      set({ kycStats: stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de KYC',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchKYCRequestsByUser: async (userId) => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await kycService.getKYCRequestsByUser(
        userId,
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        requests: response.requests,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar solicitações de KYC do usuário',
        isLoading: false,
      });
      throw error;
    }
  },

  updateKYCRequest: async (requestId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRequest = await kycService.updateKYCRequest(requestId, data);
      set((state) => ({
        requests: state.requests.map((request) =>
          request.id === requestId ? updatedRequest : request
        ),
        selectedRequest: state.selectedRequest
          ? { ...state.selectedRequest, request: updatedRequest }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar solicitação de KYC',
        isLoading: false,
      });
      throw error;
    }
  },

  updateKYCDocument: async (requestId, documentId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRequest = await kycService.updateKYCDocument(
        requestId,
        documentId,
        data
      );
      set((state) => ({
        requests: state.requests.map((request) =>
          request.id === requestId ? updatedRequest : request
        ),
        selectedRequest: state.selectedRequest
          ? { ...state.selectedRequest, request: updatedRequest }
          : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar documento de KYC',
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
