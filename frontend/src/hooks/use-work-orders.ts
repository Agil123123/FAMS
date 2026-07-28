import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersApi, CreateWorkOrderInput } from '../lib/api/work-orders';
import { toast } from 'sonner';

export const useWorkOrders = () => {
  return useQuery({
    queryKey: ['work-orders'],
    queryFn: workOrdersApi.getAll,
  });
};

export const useWorkOrder = (id: string) => {
  return useQuery({
    queryKey: ['work-order', id],
    queryFn: () => workOrdersApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkOrderInput) => workOrdersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Work Order created successfully');
    },
    onError: () => toast.error('Failed to create Work Order')
  });
};

export const useUpdateWorkOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) => workOrdersApi.updateStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.id] });
      toast.success(`Status updated to ${variables.status}`);
    },
    onError: () => toast.error('Failed to update status')
  });
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) => workOrdersApi.addTask(id, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.id] });
      toast.success('Task added successfully');
    },
    onError: () => toast.error('Failed to add task')
  });
};

export const useToggleTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, is_completed, workOrderId }: { taskId: string; is_completed: boolean; workOrderId: string }) => 
      workOrdersApi.toggleTask(taskId, is_completed),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.workOrderId] });
    },
    onError: () => toast.error('Failed to update task')
  });
};

export const useAddPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, photo_url }: { id: string; photo_url: string }) => workOrdersApi.addPhoto(id, photo_url),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.id] });
      toast.success('Photo uploaded successfully');
    },
    onError: () => toast.error('Failed to upload photo')
  });
};
