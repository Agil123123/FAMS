import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi, CreateAssetInput } from '../lib/api/assets';

export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsApi.findAll(),
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetsApi.findOne(id),
    enabled: !!id,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssetInput) => assetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAssetInput> }) =>
      assetsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useAssetPhotos = (id: string) => {
  return useQuery({
    queryKey: ['assets', id, 'photos'],
    queryFn: () => assetsApi.getPhotos(id),
    enabled: !!id,
  });
};

export const useAssetDocuments = (id: string) => {
  return useQuery({
    queryKey: ['assets', id, 'documents'],
    queryFn: () => assetsApi.getDocuments(id),
    enabled: !!id,
  });
};

export const useAssetHistory = (id: string) => {
  return useQuery({
    queryKey: ['assets', id, 'history'],
    queryFn: () => assetsApi.getHistory(id),
    enabled: !!id,
  });
};
