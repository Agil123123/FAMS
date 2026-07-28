import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemApi } from '../lib/api/system';
import { toast } from 'sonner';

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => systemApi.getHealth(),
    refetchInterval: 30000, // Refresh every 30s
  });
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: () => systemApi.getSettings(),
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: { key: string; value: string; group?: string }[]) => systemApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('System settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update system settings');
    }
  });
};

export const useSystemBackup = () => {
  return useMutation({
    mutationFn: () => systemApi.triggerBackup(),
    onSuccess: () => {
      toast.success('Database backup initiated successfully');
    },
    onError: () => {
      toast.error('Failed to initiate backup');
    }
  });
};
