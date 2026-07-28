import api from '../api';

export interface Odc {
  id: string;
  asset_code: string;
  name: string;
  pon_port_id: string;
  created_at: string;
  pon_port?: {
    id: string;
    olt?: {
      id: string;
      name: string;
      asset_code: string;
    };
  };
}

export interface CreateOdcInput {
  asset_code: string;
  name: string;
  pon_port_id: string;
}

export const odcsApi = {
  findAll: async () => {
    const { data } = await api.get<Odc[]>('/odcs');
    return data;
  },

  create: async (payload: CreateOdcInput) => {
    const { data } = await api.post<Odc>('/odcs', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateOdcInput>) => {
    const { data } = await api.patch<Odc>(`/odcs/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete(`/odcs/${id}`);
    return data;
  },
};
