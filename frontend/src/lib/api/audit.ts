import api from '../api';

export interface AuditLogItem {
  id: string;
  module: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  user?: { full_name: string; username: string };
  changes?: any;
  created_at: string;
}

export interface AuditLogResponse {
  data: AuditLogItem[];
  total: number;
  skip: number;
  take: number;
}

export interface AuditLogParams {
  skip?: number;
  take?: number;
  module?: string;
  action?: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
}

export const auditApi = {
  getAuditLogs: async (params: AuditLogParams) => {
    const { data } = await api.get<AuditLogResponse>('/audit', { params });
    return data;
  },
};
