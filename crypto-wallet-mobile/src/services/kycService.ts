import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import {
  KYCLevel,
  KYCRequest,
  UploadDocumentData,
  SubmitKYCData,
} from '@/types/kyc';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const KYC_API = `${API_URL}/kyc`;

class KYCService {
  private static instance: KYCService;
  private token: string | null = null;

  private constructor() {}

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

  public setToken(token: string) {
    this.token = token;
  }

  public async getKYCLevels(): Promise<KYCLevel[]> {
    try {
      const response = await axios.get(`${KYC_API}/levels`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getCurrentRequest(): Promise<KYCRequest | null> {
    try {
      const response = await axios.get(`${KYC_API}/current`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw this.handleError(error);
    }
  }

  public async uploadDocument(data: UploadDocumentData): Promise<string> {
    try {
      // Get upload URL
      const urlResponse = await axios.post(
        `${KYC_API}/upload-url`,
        { type: data.type, mimeType: data.mimeType },
        { headers: this.getHeaders() }
      );
      const { uploadUrl, fileUrl } = urlResponse.data;

      // Upload file
      const fileInfo = await FileSystem.getInfoAsync(data.uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const base64 = await FileSystem.readAsStringAsync(data.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await axios.put(uploadUrl, base64, {
        headers: {
          'Content-Type': data.mimeType,
        },
      });

      return fileUrl;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async submitKYC(data: SubmitKYCData): Promise<KYCRequest> {
    try {
      // Upload all documents first
      const uploadPromises = data.documents.map((doc) =>
        this.uploadDocument(doc)
      );
      const documentUrls = await Promise.all(uploadPromises);

      // Submit KYC request with document URLs
      const documents = data.documents.map((doc, index) => ({
        type: doc.type,
        url: documentUrls[index],
      }));

      const response = await axios.post(
        `${KYC_API}/submit`,
        { level: data.level, documents },
        { headers: this.getHeaders() }
      );

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
