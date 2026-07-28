import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api/dashboard';

export const useDashboardKpis = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpi'],
    queryFn: () => dashboardApi.getKpis(),
  });
};

export const useDashboardActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardApi.getActivity(),
  });
};

export const useDashboardCapacity = () => {
  return useQuery({
    queryKey: ['dashboard', 'capacity'],
    queryFn: () => dashboardApi.getCapacity(),
  });
};

export const useDashboardAlarms = () => {
  return useQuery({
    queryKey: ['dashboard', 'alarm'],
    queryFn: () => dashboardApi.getAlarms(),
  });
};
