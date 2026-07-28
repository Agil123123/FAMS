import api from '../api';

export interface DashboardAggregate {
  active_alarms: number;
  offline_devices: number;
  active_work_orders: number;
  system_health: number;
}

export interface Alarm {
  id: string;
  device_type: string;
  device_id: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface DeviceStatus {
  id: string;
  device_type: string;
  device_id: string;
  status: string;
  last_seen: string;
}

export const monitoringApi = {
  getDashboard: async () => {
    const { data } = await api.get<DashboardAggregate>('/monitoring/dashboard');
    return data;
  },

  getAlarms: async () => {
    const { data } = await api.get<Alarm[]>('/monitoring/alarms');
    return data;
  },

  resolveAlarm: async (id: string) => {
    const { data } = await api.patch(`/monitoring/alarms/${id}/resolve`);
    return data;
  },

  getStatuses: async () => {
    const { data } = await api.get<DeviceStatus[]>('/monitoring/status');
    return data;
  },

  testTriggerAlarm: async (payload: { device_type: string; device_id: string; severity: string; message: string }) => {
    const { data } = await api.post('/monitoring/test-trigger', payload);
    return data;
  }
};
