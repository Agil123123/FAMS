import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, CreateCustomerInput, UpdateCustomerInput } from '../lib/api/customers';
import { toast } from 'sonner';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerInput) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) => customersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    },
  });
};

export const useAssignOnu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { serial_number: string; mac_address?: string } }) => customersApi.assignOnu(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast.success('ONU assigned successfully');
    },
    onError: () => toast.error('Failed to assign ONU')
  });
};

export const useAssignPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { package_profile_id: string } }) => customersApi.assignPackage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast.success('Billing Package assigned successfully');
    },
    onError: () => toast.error('Failed to assign package')
  });
};

export const useActivateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('Customer Activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate customer');
    }
  });
};

export const useTerminateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.terminate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('Customer Terminated');
    },
    onError: () => toast.error('Failed to terminate customer')
  });
};

export const useRelocateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newOdpId }: { id: string; newOdpId: string }) => customersApi.relocate(id, newOdpId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      toast.success('Customer Relocated and set to WAITING_INSTALLATION');
    },
    onError: () => toast.error('Failed to relocate customer')
  });
};
