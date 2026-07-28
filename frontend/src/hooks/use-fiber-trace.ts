import { useQuery } from '@tanstack/react-query';
import { fiberTraceApi } from '../lib/api/fiber-trace';

export const useTraceFromCustomer = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['fiber-trace', 'customer', id],
    queryFn: () => fiberTraceApi.traceFromCustomer(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useTraceFromOdp = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['fiber-trace', 'odp', id],
    queryFn: () => fiberTraceApi.traceFromOdp(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useTraceFromCore = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['fiber-trace', 'core', id],
    queryFn: () => fiberTraceApi.traceFromCore(id),
    enabled: !!id && (options?.enabled !== false),
  });
};
