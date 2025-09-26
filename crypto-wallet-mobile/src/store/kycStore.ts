import { create } from 'zustand';
import {
  KYCState,
  UploadDocumentData,
  SubmitKYCData,
} from '@/types/kyc';
import KYCService from '@/services/kycService';

interface KYCStore extends KYCState {
  initialize: () => Promise<void>;
  uploadDocument: (data: UploadDocumentData) => Promise<string>;
  submitKYC: (data: SubmitKYCData) => Promise<void>;
  clearError: () => void;
}

const kycService = KYCService.getInstance();

export const useKYCStore = create<KYCStore>((set) => ({
  currentLevel: 0,
  levels: [],
  currentRequest: undefined,
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [levels, currentRequest] = await Promise.all([
        kycService.getKYCLevels(),
        kycService.getCurrentRequest(),
      ]);

      const currentLevel = levels.findIndex(
        (level) => level.status === 'COMPLETED'
      );

      set({
        levels,
        currentRequest: currentRequest || undefined,
        currentLevel: currentLevel >= 0 ? currentLevel : 0,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao inicializar KYC',
        isLoading: false,
      });
      throw error;
    }
  },

  uploadDocument: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const fileUrl = await kycService.uploadDocument(data);
      set({ isLoading: false });
      return fileUrl;
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao enviar documento',
        isLoading: false,
      });
      throw error;
    }
  },

  submitKYC: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const request = await kycService.submitKYC(data);
      set((state) => ({
        currentRequest: request,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao enviar solicitação de KYC',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
