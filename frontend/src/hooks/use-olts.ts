import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { oltsApi, CreateOltInput } from '../lib/api/olts';

export const useOlts = () => {
  return useQuery({
    queryKey: ['olts'],
    queryFn: () => oltsApi.findAll(),
  });
};

export const useCreateOlt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOltInput) => oltsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olts'] });
    },
  });
};

export const useUpdateOlt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOltInput> }) =>
      oltsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olts'] });
    },
  });
};

export const useDeleteOlt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => oltsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olts'] });
    },
  });
};
