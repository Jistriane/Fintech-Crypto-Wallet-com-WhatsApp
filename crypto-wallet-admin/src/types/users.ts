export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'viewer';
  kycLevel: number;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserFilters {
  search?: string;
  role?: User['role'];
  kycLevel?: number;
  kycStatus?: User['kycStatus'];
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserSort {
  field: keyof User;
  direction: 'asc' | 'desc';
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
}

export interface UsersResponse {
  users: User[];
  pagination: UserPagination;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role: User['role'];
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: User['role'];
  isActive?: boolean;
}

export interface UpdateUserKYCData {
  kycLevel: number;
  kycStatus: User['kycStatus'];
  notes?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'LOGIN' | 'LOGOUT' | 'KYC_UPDATE' | 'ROLE_UPDATE' | 'STATUS_UPDATE';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  kycDistribution: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
  roleDistribution: {
    admin: number;
    manager: number;
    viewer: number;
  };
  registrationTrend: {
    date: string;
    count: number;
  }[];
}
