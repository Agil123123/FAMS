import api from '../api';

export interface Odp {
  id: string;
  asset_code: string;
  name: string;
  closure_id: string;
  created_at: string;
  closure?: {
    id: string;
    name: string;
    asset_code: string;
  };
}

export interface OdpCapacity {
  total_ports: number;
  used_ports: number;
  available_ports: number;
  utilization_percentage: number;
}

export interface CreateOdpInput {
  asset_code: string;
  name: string;
  closure_id: string;
}

export const odpsApi = {
  findAll: async () => {
    const { data } = await api.get<Odp[]>('/odps');
    return data;
  },

  findOne: async (id: string) => {
    const { data } = await api.get<Odp>(`/odps/${id}`);
    return data;
  },

  create: async (payload: CreateOdpInput) => {
    const { data } = await api.post<Odp>('/odps', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateOdpInput>) => {
    const { data } = await api.patch<Odp>(`/odps/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete(`/odps/${id}`);
    return data;
  },

  getCapacity: async (id: string) => {
    const { data } = await api.get<OdpCapacity>(`/odps/${id}/capacity`);
    return data;
  },

  getPorts: async (id: string) => {
    const { data } = await api.get(`/odps/${id}/ports`);
    return data;
  },

  getCustomers: async (id: string) => {
    const { data } = await api.get(`/odps/${id}/customers`);
    return data;
  }
};
