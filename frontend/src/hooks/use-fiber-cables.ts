import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fiberCablesApi, CreateFiberCableInput } from '../lib/api/fiber-cables';

export const useFiberCables = () => {
  return useQuery({
    queryKey: ['fiber-cables'],
    queryFn: () => fiberCablesApi.findAll(),
  });
};

export const useCreateFiberCable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFiberCableInput) => fiberCablesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiber-cables'] });
    },
  });
};

export const useUpdateFiberCable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFiberCableInput> }) =>
      fiberCablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiber-cables'] });
    },
  });
};

export const useDeleteFiberCable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fiberCablesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiber-cables'] });
    },
  });
};
