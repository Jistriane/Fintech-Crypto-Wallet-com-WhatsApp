export interface KYCDocument {
  id: string;
  userId: string;
  type: 'ID_FRONT' | 'ID_BACK' | 'SELFIE' | 'PROOF_OF_ADDRESS' | 'PROOF_OF_INCOME';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  url: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface KYCRequest {
  id: string;
  userId: string;
  level: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: KYCDocument[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface KYCFilters {
  search?: string;
  level?: number;
  status?: KYCRequest['status'];
  startDate?: string;
  endDate?: string;
}

export interface KYCSort {
  field: keyof KYCRequest;
  direction: 'asc' | 'desc';
}

export interface KYCPagination {
  page: number;
  limit: number;
  total: number;
}

export interface KYCResponse {
  requests: KYCRequest[];
  pagination: KYCPagination;
}

export interface KYCStats {
  totalRequests: number;
  levelDistribution: {
    level: number;
    count: number;
  }[];
  statusDistribution: {
    status: KYCRequest['status'];
    count: number;
  }[];
  requestHistory: {
    date: string;
    count: number;
  }[];
  averageProcessingTime: number;
}

export interface KYCEvent {
  id: string;
  requestId: string;
  type: 'CREATED' | 'DOCUMENT_UPLOADED' | 'DOCUMENT_REVIEWED' | 'STATUS_UPDATED';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy?: string;
}

export interface KYCDetails {
  request: KYCRequest;
  events: KYCEvent[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    currentLevel: number;
  };
}

export interface UpdateKYCRequestData {
  status: KYCRequest['status'];
  notes?: string;
}

export interface UpdateKYCDocumentData {
  status: KYCDocument['status'];
  notes?: string;
}
