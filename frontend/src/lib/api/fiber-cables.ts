import api from '../api';

export interface FiberCable {
  id: string;
  asset_code: string;
  cable_type_id: string;
  length_meters: number;
  created_at: string;
  cable_type?: {
    id: string;
    name: string;
  };
}

export interface CreateFiberCableInput {
  asset_code: string;
  cable_type_id: string;
  length_meters: number;
}

export const fiberCablesApi = {
  findAll: async () => {
    const { data } = await api.get<FiberCable[]>('/fiber/cables');
    return data;
  },

  create: async (payload: CreateFiberCableInput) => {
    const { data } = await api.post<FiberCable>('/fiber/cables', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateFiberCableInput>) => {
    const { data } = await api.patch<FiberCable>(`/fiber/cables/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete(`/fiber/cables/${id}`);
    return data;
  },
};
