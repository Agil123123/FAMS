import api from '../api';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  status: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  getUsers: async (params: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  createUser: async (payload: Partial<User> & { password?: string }) => {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  updateUser: async (id: string, payload: Partial<User> & { password?: string }) => {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
