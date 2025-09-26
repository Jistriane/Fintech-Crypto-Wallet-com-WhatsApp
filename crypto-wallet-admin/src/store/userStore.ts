import { create } from 'zustand';
import {
  User,
  UserFilters,
  UserSort,
  UserPagination,
  CreateUserData,
  UpdateUserData,
  UpdateUserKYCData,
  UserActivity,
  UserStats,
} from '@/types/users';
import UserService from '@/services/userService';

interface UserState {
  users: User[];
  selectedUser: User | null;
  userActivity: UserActivity[];
  userStats: UserStats | null;
  filters: UserFilters;
  sort: UserSort;
  pagination: UserPagination;
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  fetchUserActivity: (userId: string) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  createUser: (data: CreateUserData) => Promise<void>;
  updateUser: (userId: string, data: UpdateUserData) => Promise<void>;
  updateUserKYC: (userId: string, data: UpdateUserKYCData) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
  setSort: (sort: UserSort) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

const userService = UserService.getInstance();

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUser: null,
  userActivity: [],
  userStats: null,
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    const { filters, sort, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUsers(
        filters,
        sort,
        pagination.page,
        pagination.limit
      );
      set({
        users: response.users,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar usuários',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserById: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.getUserById(userId);
      set({ selectedUser: user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar usuário',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserActivity: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const activity = await userService.getUserActivity(userId);
      set({ userActivity: activity, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar atividade do usuário',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await userService.getUserStats();
      set({ userStats: stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao buscar estatísticas de usuários',
        isLoading: false,
      });
      throw error;
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await userService.createUser(data);
      await get().fetchUsers();
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao criar usuário',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateUser(userId, data);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? updatedUser : user
        ),
        selectedUser: updatedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar usuário',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUserKYC: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateUserKYC(userId, data);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? updatedUser : user
        ),
        selectedUser: updatedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Falha ao atualizar KYC do usuário',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
  },

  setSort: (sort) => {
    set({ sort });
  },

  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
  },

  clearError: () => set({ error: null }),
}));
