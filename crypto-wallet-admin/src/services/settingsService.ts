import axios from 'axios';

export interface Settings {
  kycAutoApproval: boolean;
  minTransactionAmount: string;
  maxTransactionAmount: string;
  whatsappNotificationDelay: string;
  rateLimit: {
    requests: string;
    duration: string;
  };
  blockchainSettings: {
    gasPrice: string;
    confirmations: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getSettings = async (): Promise<Settings> => {
  const response = await axios.get(`${API_URL}/admin/settings`);
  return response.data;
};

export const updateSettings = async (settings: Settings): Promise<Settings> => {
  const response = await axios.put(`${API_URL}/admin/settings`, settings);
  return response.data;
};