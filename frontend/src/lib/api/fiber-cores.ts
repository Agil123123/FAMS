import api from '../api';

export interface FiberCore {
  id: string;
  fiber_cable_id: string;
  core_index: number;
  color_code?: string;
  created_at: string;
  fiber_cable?: {
    id: string;
    asset_code: string;
  };
}

export interface UpdateFiberCoreInput {
  color_code?: string;
}

export const fiberCoresApi = {
  findAll: async () => {
    const { data } = await api.get<FiberCore[]>('/fiber/cores');
    return data;
  },

  update: async (id: string, payload: UpdateFiberCoreInput) => {
    const { data } = await api.patch<FiberCore>(`/fiber/cores/${id}`, payload);
    return data;
  },
};
