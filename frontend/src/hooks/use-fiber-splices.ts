import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fiberSplicesApi, CreateFiberSpliceInput } from '../lib/api/fiber-splices';

export const useFiberSplices = () => {
  return useQuery({
    queryKey: ['fiber-splices'],
    queryFn: () => fiberSplicesApi.findAll(),
  });
};

export const useCreateFiberSplice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFiberSpliceInput) => fiberSplicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiber-splices'] });
      // Invalidate cores to ensure linked state stays fresh
      queryClient.invalidateQueries({ queryKey: ['fiber-cores'] });
    },
  });
};
