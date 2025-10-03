import api from './api';
import type {
  KYCRequest,
  KYCStats,
  KYCFilters,
  KYCStatus,
  DocumentType,
} from '@/types/kyc';

export const kycService = {
  async getRequests(
    page = 1,
    limit = 10,
    filters?: KYCFilters
  ): Promise<{ requests: KYCRequest[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const { data } = await api.get(`/kyc/requests?${params}`);
    return data;
  },

  async getRequest(id: string): Promise<KYCRequest> {
    const { data } = await api.get(`/kyc/requests/${id}`);
    return data;
  },

  async getStats(): Promise<KYCStats> {
    const { data } = await api.get('/kyc/stats');
    return data;
  },

  async approveRequest(id: string, level: number): Promise<void> {
    await api.post(`/kyc/requests/${id}/approve`, { level });
  },

  async rejectRequest(id: string, reason: string): Promise<void> {
    await api.post(`/kyc/requests/${id}/reject`, { reason });
  },

  async requestAdditionalDocuments(
    id: string,
    documents: DocumentType[]
  ): Promise<void> {
    await api.post(`/kyc/requests/${id}/request-documents`, { documents });
  },

  async updateDocumentStatus(
    requestId: string,
    documentId: string,
    status: KYCStatus,
    rejectionReason?: string
  ): Promise<void> {
    await api.put(`/kyc/requests/${requestId}/documents/${documentId}`, {
      status,
      rejectionReason,
    });
  },

  async downloadDocument(requestId: string, documentId: string): Promise<Blob> {
    const { data } = await api.get(
      `/kyc/requests/${requestId}/documents/${documentId}/download`,
      {
        responseType: 'blob',
      }
    );
    return data;
  },

  async exportRequests(
    format: 'csv' | 'pdf' = 'csv',
    filters?: KYCFilters
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...filters,
    });

    const { data } = await api.get(`/kyc/requests/export?${params}`, {
      responseType: 'blob',
    });
    return data;
  },
};
