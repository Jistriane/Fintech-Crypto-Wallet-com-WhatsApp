export type KYCStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type KYCLevel = 0 | 1 | 2 | 3;

export interface KYCLimits {
  dailyLimit: string;
  monthlyLimit: string;
  singleTransactionLimit: string;
  allowedOperations: string[];
}

export interface KYCRequirements {
  level: KYCLevel;
  documents: {
    type: string;
    description: string;
    required: boolean;
  }[];
  personalInfo: {
    field: string;
    type: string;
    required: boolean;
  }[];
}

export interface KYCDocument {
  type: string;
  imageUri: string;
  status: KYCStatus;
  rejectionReason?: string;
}

export interface KYCPersonalInfo {
  fullName: string;
  birthDate: string;
  nationality: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  documents: {
    type: string;
    number: string;
    issueDate: string;
    issuer: string;
  }[];
}

export interface KYCSubmission {
  level: KYCLevel;
  documents: KYCDocument[];
  personalInfo: KYCPersonalInfo;
}

export interface KYCState {
  currentLevel: KYCLevel;
  targetLevel: KYCLevel;
  status: KYCStatus;
  limits: KYCLimits;
  requirements: KYCRequirements;
  submission?: KYCSubmission;
  isLoading: boolean;
  error: string | null;
}
