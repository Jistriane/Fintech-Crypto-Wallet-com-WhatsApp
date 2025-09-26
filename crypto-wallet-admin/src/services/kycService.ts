import axios from 'axios';
import {
  KYCRequest,
  KYCFilters,
  KYCSort,
  KYCResponse,
  KYCStats,
  KYCDetails,
  UpdateKYCRequestData,
  UpdateKYCDocumentData,
} from '@/types/kyc';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const KYC_API = `${API_URL}/api/kyc`;

class KYCService {
  private static instance: KYCService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async getKYCRequests(
    filters?: KYCFilters,
    sort?: KYCSort,
    page = 1,
    limit = 10
  ): Promise<KYCResponse> {
    try {
      const response = await axios.get(KYC_API, {
        params: {
          ...filters,
          sortField: sort?.field,
          sortDirection: sort?.direction,
          page,
          limit,
        },
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getKYCRequestById(requestId: string): Promise<KYCDetails> {
    try {
      const response = await axios.get(`${KYC_API}/${requestId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getKYCStats(): Promise<KYCStats> {
    try {
      const response = await axios.get(`${KYC_API}/stats`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateKYCRequest(
    requestId: string,
    data: UpdateKYCRequestData
  ): Promise<KYCRequest> {
    try {
      const response = await axios.put(
        `${KYC_API}/${requestId}`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateKYCDocument(
    requestId: string,
    documentId: string,
    data: UpdateKYCDocumentData
  ): Promise<KYCRequest> {
    try {
      const response = await axios.put(
        `${KYC_API}/${requestId}/documents/${documentId}`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getKYCRequestsByUser(
    userId: string,
    filters?: Omit<KYCFilters, 'search'>,
    sort?: KYCSort,
    page = 1,
    limit = 10
  ): Promise<KYCResponse> {
    try {
      const response = await axios.get(`${KYC_API}/user/${userId}`, {
        params: {
          ...filters,
          sortField: sort?.field,
          sortDirection: sort?.direction,
          page,
          limit,
        },
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.message || 'Erro ao processar requisição';
      const customError = new Error(message);
      customError.name = error.response.status.toString();
      return customError;
    }
    return new Error('Erro de conexão com o servidor');
  }
}

export default KYCService;
