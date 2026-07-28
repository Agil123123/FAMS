import api from '../api';

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  description?: string;
  asset_type_id: string;
  vendor_id?: string;
  status: string;
  created_at: string;
  asset_type?: { name: string };
  vendor?: { name: string };
}

export interface CreateAssetInput {
  asset_code: string;
  name: string;
  description?: string;
  asset_type_id: string;
  vendor_id?: string;
  status?: string;
}

export interface AssetPhoto {
  id: string;
  photo_url: string;
  created_at: string;
}

export interface AssetDocument {
  id: string;
  document_type: string;
  file_url: string;
  created_at: string;
}

export interface AssetHistory {
  id: string;
  action: string;
  notes?: string;
  created_at: string;
}

export const assetsApi = {
  findAll: async () => {
    const { data } = await api.get<Asset[]>('/assets');
    return data;
  },

  findOne: async (id: string) => {
    const { data } = await api.get<Asset>(`/assets/${id}`);
    return data;
  },

  create: async (payload: CreateAssetInput) => {
    const { data } = await api.post<Asset>('/assets', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateAssetInput>) => {
    const { data } = await api.patch<Asset>(`/assets/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete(`/assets/${id}`);
    return data;
  },

  getPhotos: async (id: string) => {
    const { data } = await api.get<AssetPhoto[]>(`/assets/${id}/photos`);
    return data;
  },

  getDocuments: async (id: string) => {
    const { data } = await api.get<AssetDocument[]>(`/assets/${id}/documents`);
    return data;
  },

  getHistory: async (id: string) => {
    const { data } = await api.get<AssetHistory[]>(`/assets/${id}/history`);
    return data;
  },
};
