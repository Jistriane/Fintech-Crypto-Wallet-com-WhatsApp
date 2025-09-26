export interface KYCLevel {
  level: number;
  name: string;
  description: string;
  requirements: string[];
  limits: {
    daily: number;
    monthly: number;
  };
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface KYCDocument {
  id: string;
  type: 'ID_FRONT' | 'ID_BACK' | 'SELFIE' | 'PROOF_OF_ADDRESS' | 'PROOF_OF_INCOME';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

export interface KYCRequest {
  id: string;
  level: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: KYCDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

export interface KYCState {
  currentLevel: number;
  levels: KYCLevel[];
  currentRequest?: KYCRequest;
  isLoading: boolean;
  error: string | null;
}

export interface UploadDocumentData {
  type: KYCDocument['type'];
  uri: string;
  mimeType: string;
}

export interface SubmitKYCData {
  level: number;
  documents: UploadDocumentData[];
}
