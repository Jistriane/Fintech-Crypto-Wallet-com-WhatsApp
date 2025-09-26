import axios from 'axios';
import { KYCLevel, KYCStatus, KYCSubmission, KYCLimits, KYCRequirements } from '../types/kyc';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class KYCService {
  private static instance: KYCService;
  private api = axios.create({
    baseURL: `${API_URL}/kyc`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {}

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  public async getKYCStatus(): Promise<{
    currentLevel: KYCLevel;
    status: KYCStatus;
    limits: KYCLimits;
  }> {
    try {
      const response = await this.api.get('/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getKYCRequirements(level: KYCLevel): Promise<KYCRequirements> {
    try {
      const response = await this.api.get(`/requirements/${level}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async submitKYC(submission: KYCSubmission): Promise<void> {
    try {
      const formData = new FormData();

      // Adicionar documentos
      submission.documents.forEach((doc) => {
        formData.append('documents', {
          uri: doc.imageUri,
          type: 'image/jpeg',
          name: `${doc.type}.jpg`,
        });
      });

      // Adicionar informações pessoais
      formData.append('personalInfo', JSON.stringify(submission.personalInfo));
      formData.append('level', submission.level.toString());

      await this.api.post('/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async uploadDocument(
    type: string,
    imageUri: string
  ): Promise<{ documentId: string }> {
    try {
      const formData = new FormData();
      formData.append('document', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${type}.jpg`,
      });
      formData.append('type', type);

      const response = await this.api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getSubmissionStatus(level: KYCLevel): Promise<{
    status: KYCStatus;
    rejectionReason?: string;
  }> {
    try {
      const response = await this.api.get(`/submission/${level}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getCurrentLimits(): Promise<KYCLimits> {
    try {
      const response = await this.api.get('/limits');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getLevelLimits(level: KYCLevel): Promise<KYCLimits> {
    try {
      const response = await this.api.get(`/limits/${level}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Erro ao processar a requisição';
      return new Error(message);
    }
    return error;
  }
}

export default KYCService.getInstance();
