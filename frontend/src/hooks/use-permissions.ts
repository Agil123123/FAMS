import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '../lib/api/permissions';

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getPermissions(),
  });
};
