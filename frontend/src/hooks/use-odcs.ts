import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odcsApi, CreateOdcInput } from '../lib/api/odcs';

export const useOdcs = () => {
  return useQuery({
    queryKey: ['odcs'],
    queryFn: () => odcsApi.findAll(),
  });
};

export const useCreateOdc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOdcInput) => odcsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odcs'] });
    },
  });
};

export const useUpdateOdc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOdcInput> }) =>
      odcsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odcs'] });
    },
  });
};

export const useDeleteOdc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => odcsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odcs'] });
    },
  });
};
