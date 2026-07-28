import api from '../api';

export interface Splitter {
  id: string;
  asset_code: string;
  odp_id: string;
  splitter_type_id: string;
  created_at: string;
  odp?: {
    id: string;
    name: string;
    asset_code: string;
  };
  splitter_type?: {
    id: string;
    name: string;
  };
}

export interface CreateSplitterInput {
  asset_code: string;
  odp_id: string;
  splitter_type_id: string;
}

export const splittersApi = {
  findAll: async () => {
    const { data } = await api.get<Splitter[]>('/splitters');
    return data;
  },

  create: async (payload: CreateSplitterInput) => {
    const { data } = await api.post<Splitter>('/splitters', payload);
    return data;
  }
};
