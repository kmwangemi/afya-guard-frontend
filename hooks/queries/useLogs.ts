import { logsService } from '@/services/logsService';
import { LogFilterParams } from '@/types/log';
import { useQuery } from '@tanstack/react-query';

const LOGS_KEY = 'logs';

export function useLogs(
  filters: LogFilterParams = {},
  page: number = 1,
  pageSize: number = 50,
) {
  return useQuery({
    queryKey: [LOGS_KEY, 'list', filters, page, pageSize],
    queryFn: () => logsService.getLogs(filters, page, pageSize),
    staleTime: 60 * 1000, // logs are immutable — 1 min stale ok
    refetchInterval: 30 * 1000, // auto-refresh every 30s for live tail
  });
}
