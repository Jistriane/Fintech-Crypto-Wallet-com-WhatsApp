export type KYCStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export type DocumentType =
  | 'rg'
  | 'cnh'
  | 'passport'
  | 'proof_of_address'
  | 'selfie';

export interface KYCDocument {
  id: string;
  type: DocumentType;
  url: string;
  status: KYCStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCRequest {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
  };
  status: KYCStatus;
  level: 1 | 2 | 3;
  documents: KYCDocument[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface KYCStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageReviewTime: number;
  completionRate: number;
}

export interface KYCFilters {
  status?: KYCStatus;
  level?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}
