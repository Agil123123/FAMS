import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odpsApi, CreateOdpInput } from '../lib/api/odps';

export const useOdps = () => {
  return useQuery({
    queryKey: ['odps'],
    queryFn: () => odpsApi.findAll(),
  });
};

export const useOdp = (id: string) => {
  return useQuery({
    queryKey: ['odps', id],
    queryFn: () => odpsApi.findOne(id),
    enabled: !!id,
  });
};

export const useCreateOdp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOdpInput) => odpsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odps'] });
    },
  });
};

export const useUpdateOdp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOdpInput> }) =>
      odpsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['odps'] });
      queryClient.invalidateQueries({ queryKey: ['odps', variables.id] });
    },
  });
};

export const useDeleteOdp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => odpsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odps'] });
    },
  });
};

export const useOdpCapacity = (id: string) => {
  return useQuery({
    queryKey: ['odps', id, 'capacity'],
    queryFn: () => odpsApi.getCapacity(id),
    enabled: !!id,
  });
};

export const useOdpPorts = (id: string) => {
  return useQuery({
    queryKey: ['odps', id, 'ports'],
    queryFn: () => odpsApi.getPorts(id),
    enabled: !!id,
  });
};

export const useOdpCustomers = (id: string) => {
  return useQuery({
    queryKey: ['odps', id, 'customers'],
    queryFn: () => odpsApi.getCustomers(id),
    enabled: !!id,
  });
};
