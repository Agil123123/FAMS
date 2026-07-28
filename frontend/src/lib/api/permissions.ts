import api from '../api';

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
}

export const permissionsApi = {
  getPermissions: async () => {
    const { data } = await api.get<Permission[]>('/permissions');
    return data;
  },
};
