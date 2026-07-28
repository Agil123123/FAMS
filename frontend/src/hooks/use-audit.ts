import { useQuery } from '@tanstack/react-query';
import { auditApi, AuditLogParams } from '../lib/api/audit';

export const useAuditLogs = (params: AuditLogParams) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.getAuditLogs(params),
    placeholderData: (previousData) => previousData,
  });
};
