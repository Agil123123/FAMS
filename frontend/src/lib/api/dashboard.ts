import api from '../api';

export interface DashboardKpis {
  totalCustomers: number;
  totalHomepasses: number;
  totalOpenWorkOrders: number;
  criticalAlarms: number;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
}

export interface DashboardCapacity {
  olts: number;
  odcs: number;
  odps: number;
  totalPorts: number;
  usedPorts: number;
  availablePorts: number;
  utilizationPercentage: string;
}

export interface DashboardAlarm {
  severity: string;
  count: number;
}

export const dashboardApi = {
  getKpis: async () => {
    const { data } = await api.get<DashboardKpis>('/dashboard/kpi');
    return data;
  },

  getActivity: async () => {
    const { data } = await api.get<DashboardActivity[]>('/dashboard/activity');
    return data;
  },

  getCapacity: async () => {
    const { data } = await api.get<DashboardCapacity>('/dashboard/capacity');
    return data;
  },

  getAlarms: async () => {
    const { data } = await api.get<DashboardAlarm[]>('/dashboard/alarm');
    return data;
  },
};
