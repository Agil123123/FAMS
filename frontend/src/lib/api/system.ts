import api from '../api';

export interface SystemHealthResponse {
  status: string;
  timestamp: string;
  components: {
    database: { status: string };
    redis: { status: string };
  };
  system: {
    memory_usage_mb: number;
    uptime_seconds: number;
  };
}

export interface BackupResponse {
  status: string;
  message: string;
  backup_id: string;
  timestamp: string;
}

export interface SettingItem {
  key: string;
  value: string;
  group: string;
}

export const systemApi = {
  getHealth: async () => {
    const { data } = await api.get<SystemHealthResponse>('/system/health');
    return data;
  },

  triggerBackup: async () => {
    const { data } = await api.post<BackupResponse>('/system/backup');
    return data;
  },

  getSettings: async () => {
    const { data } = await api.get<SettingItem[]>('/system/settings');
    return data;
  },

  updateSettings: async (settings: { key: string; value: string; group?: string }[]) => {
    const { data } = await api.put<SettingItem[]>('/system/settings', { settings });
    return data;
  },
};
