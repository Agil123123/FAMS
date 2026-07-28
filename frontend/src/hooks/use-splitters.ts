import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { splittersApi, CreateSplitterInput } from '../lib/api/splitters';

export const useSplitters = () => {
  return useQuery({
    queryKey: ['splitters'],
    queryFn: () => splittersApi.findAll(),
  });
};

export const useCreateSplitter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSplitterInput) => splittersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splitters'] });
      // Invalidate ODP ports if we create a new splitter connected to an ODP
      queryClient.invalidateQueries({ queryKey: ['odps'] });
    },
  });
};
