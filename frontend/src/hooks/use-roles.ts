import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, Role } from '../lib/api/roles';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesApi.getRole(id),
    enabled: !!id,
  });
};



export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; permission_ids?: string[] }) => rolesApi.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string; permission_ids?: string[] } }) =>
      rolesApi.updateRole(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', id] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
