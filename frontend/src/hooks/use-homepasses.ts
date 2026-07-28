import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homepassesApi, CreateHomepassInput, UpdateHomepassInput } from '../lib/api/homepasses';

export const useHomepasses = () => {
  return useQuery({
    queryKey: ['homepasses'],
    queryFn: homepassesApi.getAll,
  });
};

export const useHomepass = (id: string) => {
  return useQuery({
    queryKey: ['homepass', id],
    queryFn: () => homepassesApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateHomepass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHomepassInput) => homepassesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepasses'] });
    },
  });
};

export const useUpdateHomepass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHomepassInput }) => homepassesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homepasses'] });
      queryClient.invalidateQueries({ queryKey: ['homepass', variables.id] });
    },
  });
};

export const useDeleteHomepass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => homepassesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepasses'] });
    },
  });
};
