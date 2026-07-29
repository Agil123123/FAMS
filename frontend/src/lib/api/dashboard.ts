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
    const { data } = await api.get('/dashboard/kpi');
    return (data as any).data as DashboardKpis;
  },

  getActivity: async () => {
    const { data } = await api.get('/dashboard/activity');
    return (data as any).data as DashboardActivity[];
  },

  getCapacity: async () => {
    const { data } = await api.get('/dashboard/capacity');
    return (data as any).data as DashboardCapacity;
  },

  getAlarms: async () => {
    const { data } = await api.get('/dashboard/alarm');
    return (data as any).data as DashboardAlarm[];
  },
};
