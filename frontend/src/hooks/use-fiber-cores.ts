import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fiberCoresApi, UpdateFiberCoreInput } from '../lib/api/fiber-cores';

export const useFiberCores = () => {
  return useQuery({
    queryKey: ['fiber-cores'],
    queryFn: () => fiberCoresApi.findAll(),
  });
};

export const useUpdateFiberCore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFiberCoreInput }) =>
      fiberCoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiber-cores'] });
      queryClient.invalidateQueries({ queryKey: ['fiber-cables'] });
    },
  });
};
