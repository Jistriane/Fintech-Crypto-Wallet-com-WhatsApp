import { create } from 'zustand';
import { Settings, getSettings, updateSettings } from '../services/settingsService';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialSettings: Settings = {
  kycAutoApproval: false,
  minTransactionAmount: '0.01',
  maxTransactionAmount: '10000',
  whatsappNotificationDelay: '3',
  rateLimit: {
    requests: '100',
    duration: '60',
  },
  blockchainSettings: {
    gasPrice: '50',
    confirmations: '3',
  },
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const settings = await getSettings();
      set({ settings, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar configurações',
        isLoading: false,
      });
    }
  },

  updateSettings: async (settings: Settings) => {
    try {
      set({ isLoading: true, error: null });
      const updatedSettings = await updateSettings(settings);
      set({ settings: updatedSettings, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao atualizar configurações',
        isLoading: false,
      });
      throw error;
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
}));
