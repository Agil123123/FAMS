import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringApi } from '../lib/api/monitoring';
import { toast } from 'sonner';

export const useMonitoringDashboard = () => {
  return useQuery({
    queryKey: ['monitoring-dashboard'],
    queryFn: monitoringApi.getDashboard,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useAlarms = () => {
  return useQuery({
    queryKey: ['alarms'],
    queryFn: monitoringApi.getAlarms,
    refetchInterval: 15000, // Poll every 15 seconds for live alarms
  });
};

export const useDeviceStatuses = () => {
  return useQuery({
    queryKey: ['device-statuses'],
    queryFn: monitoringApi.getStatuses,
    refetchInterval: 30000,
  });
};

export const useResolveAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => monitoringApi.resolveAlarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['monitoring-dashboard'] });
      toast.success('Alarm resolved');
    },
    onError: () => toast.error('Failed to resolve alarm')
  });
};

export const useTriggerTestAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => monitoringApi.testTriggerAlarm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      queryClient.invalidateQueries({ queryKey: ['monitoring-dashboard'] });
      toast.error('TEST ALARM TRIGGERED');
    }
  });
};
