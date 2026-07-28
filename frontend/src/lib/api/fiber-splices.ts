import api from '../api';

export interface FiberSplice {
  id: string;
  fiber_core_id: string;
  attenuation?: number;
  created_at: string;
  fiber_core?: {
    id: string;
    core_index: number;
    color_code?: string;
    fiber_cable?: {
      id: string;
      asset_code: string;
    }
  };
}

export interface CreateFiberSpliceInput {
  fiber_core_id: string;
  attenuation?: number;
}

export const fiberSplicesApi = {
  findAll: async () => {
    const { data } = await api.get<FiberSplice[]>('/fiber/splices');
    return data;
  },

  create: async (payload: CreateFiberSpliceInput) => {
    const { data } = await api.post<FiberSplice>('/fiber/splices', payload);
    return data;
  },
};
