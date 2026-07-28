import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../lib/api/notifications';
import { toast } from 'sonner';

export const useInAppNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getInApp,
    refetchInterval: 60000, // Poll every minute
  });
};

export const useTestNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.testNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Test notification dispatched to queue');
    },
    onError: () => toast.error('Failed to dispatch test notification')
  });
};
