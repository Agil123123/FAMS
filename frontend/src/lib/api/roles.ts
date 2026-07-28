import api from '../api';

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  permission: {
    id: string;
    name: string;
    module: string;
    action: string;
    description?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  role_permissions?: RolePermission[];
}

export const rolesApi = {
  getRoles: async () => {
    const { data } = await api.get<Role[]>('/roles');
    return data;
  },

  getRole: async (id: string) => {
    const { data } = await api.get<Role>(`/roles/${id}`);
    return data;
  },

  createRole: async (payload: { name: string; description?: string; permission_ids?: string[] }) => {
    const { data } = await api.post<Role>('/roles', payload);
    return data;
  },

  updateRole: async (id: string, payload: { name?: string; description?: string; permission_ids?: string[] }) => {
    const { data } = await api.patch<Role>(`/roles/${id}`, payload);
    return data;
  },

  deleteRole: async (id: string) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data;
  },

};
