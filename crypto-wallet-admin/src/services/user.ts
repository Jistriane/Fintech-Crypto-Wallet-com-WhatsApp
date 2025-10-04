import { AxiosResponse } from 'axios';
import api from './api';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

interface GetUsersResponse {
  users: User[];
  total: number;
}

interface UserFilters {
  search?: string;
  status?: string;
}

export const userService = {
  async getUsers(
    page: number = 1,
    limit: number = 10,
    filters?: UserFilters
  ): Promise<GetUsersResponse> {
    const response: AxiosResponse<GetUsersResponse> = await api.get('/users', {
      params: {
        page,
        limit,
        ...filters,
      },
    });
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<User> = await api.get(`/users/${id}`);
    return response.data;
  },

  async blockUser(id: string): Promise<void> {
    await api.post(`/users/${id}/block`);
  },

  async unblockUser(id: string): Promise<void> {
    await api.post(`/users/${id}/unblock`);
  },
};