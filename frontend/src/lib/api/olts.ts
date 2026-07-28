import api from '../api';

export interface Olt {
  id: string;
  asset_code: string;
  name: string;
  ip_address?: string;
  created_at: string;
}

export interface CreateOltInput {
  asset_code: string;
  name: string;
  ip_address?: string;
}

export const oltsApi = {
  findAll: async () => {
    const { data } = await api.get<Olt[]>('/olts');
    return data;
  },

  create: async (payload: CreateOltInput) => {
    const { data } = await api.post<Olt>('/olts', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateOltInput>) => {
    const { data } = await api.patch<Olt>(`/olts/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete(`/olts/${id}`);
    return data;
  },
};
