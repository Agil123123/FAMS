import { useQuery } from '@tanstack/react-query';
import { gisApi } from '../lib/api/gis';

export const useGisAssets = () => {
  return useQuery({
    queryKey: ['gis-assets'],
    queryFn: () => gisApi.getAssets(),
  });
};

export const useGisCustomers = () => {
  return useQuery({
    queryKey: ['gis-customers'],
    queryFn: () => gisApi.getCustomers(),
  });
};
