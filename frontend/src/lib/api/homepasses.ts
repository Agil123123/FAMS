import api from '../api';

export interface Homepass {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export type CreateHomepassInput = Omit<Homepass, 'id' | 'created_at' | 'updated_at'>;
export type UpdateHomepassInput = Partial<CreateHomepassInput>;

export const homepassesApi = {
  getAll: async () => {
    const { data } = await api.get<Homepass[]>('/homepasses');
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Homepass>(`/homepasses/${id}`);
    return data;
  },

  create: async (homepass: CreateHomepassInput) => {
    const { data } = await api.post<Homepass>('/homepasses', homepass);
    return data;
  },

  update: async (id: string, homepass: UpdateHomepassInput) => {
    const { data } = await api.patch<Homepass>(`/homepasses/${id}`, homepass);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/homepasses/${id}`);
    return data;
  },
};
