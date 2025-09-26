import { create } from 'zustand';
import {
  KYCState,
  KYCLevel,
  KYCSubmission,
  KYCDocument,
  KYCPersonalInfo,
} from '../types/kyc';
import kycService from '../services/kycService';

interface KYCStore extends KYCState {
  loadKYCStatus: () => Promise<void>;
  loadKYCRequirements: (level: KYCLevel) => Promise<void>;
  submitKYC: (submission: KYCSubmission) => Promise<void>;
  uploadDocument: (type: string, imageUri: string) => Promise<string>;
  checkSubmissionStatus: (level: KYCLevel) => Promise<void>;
  loadCurrentLimits: () => Promise<void>;
  loadLevelLimits: (level: KYCLevel) => Promise<void>;
  setTargetLevel: (level: KYCLevel) => void;
  setSubmission: (submission: Partial<KYCSubmission>) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: KYCState = {
  currentLevel: 0,
  targetLevel: 0,
  status: 'NOT_STARTED',
  limits: {
    dailyLimit: '0',
    monthlyLimit: '0',
    singleTransactionLimit: '0',
    allowedOperations: [],
  },
  requirements: {
    level: 0,
    documents: [],
    personalInfo: [],
  },
  isLoading: false,
  error: null,
};

const useKYCStore = create<KYCStore>((set, get) => ({
  ...initialState,

  loadKYCStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      const status = await kycService.getKYCStatus();
      set({
        currentLevel: status.currentLevel,
        status: status.status,
        limits: status.limits,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar status do KYC',
      });
      throw error;
    }
  },

  loadKYCRequirements: async (level: KYCLevel) => {
    try {
      set({ isLoading: true, error: null });
      const requirements = await kycService.getKYCRequirements(level);
      set({
        requirements,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar requisitos do KYC',
      });
      throw error;
    }
  },

  submitKYC: async (submission: KYCSubmission) => {
    try {
      set({ isLoading: true, error: null });
      await kycService.submitKYC(submission);
      set({
        status: 'PENDING',
        submission,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar documentos do KYC',
      });
      throw error;
    }
  },

  uploadDocument: async (type: string, imageUri: string) => {
    try {
      set({ isLoading: true, error: null });
      const { documentId } = await kycService.uploadDocument(type, imageUri);
      set({ isLoading: false });
      return documentId;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar documento',
      });
      throw error;
    }
  },

  checkSubmissionStatus: async (level: KYCLevel) => {
    try {
      set({ isLoading: true, error: null });
      const submissionStatus = await kycService.getSubmissionStatus(level);
      set({
        status: submissionStatus.status,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar status da submissão',
      });
      throw error;
    }
  },

  loadCurrentLimits: async () => {
    try {
      set({ isLoading: true, error: null });
      const limits = await kycService.getCurrentLimits();
      set({
        limits,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar limites atuais',
      });
      throw error;
    }
  },

  loadLevelLimits: async (level: KYCLevel) => {
    try {
      set({ isLoading: true, error: null });
      const limits = await kycService.getLevelLimits(level);
      set({
        limits,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar limites do nível',
      });
      throw error;
    }
  },

  setTargetLevel: (level: KYCLevel) => {
    set({ targetLevel: level });
  },

  setSubmission: (submission: Partial<KYCSubmission>) => {
    set((state) => ({
      submission: {
        ...state.submission,
        ...submission,
      },
    }));
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useKYCStore;

