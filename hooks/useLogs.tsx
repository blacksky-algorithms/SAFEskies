import { LogFilters, Log } from '@/lib/types/logs';
import { useLogFilters } from '@/hooks/useLogFilters';
import { useLogsQuery } from '@/hooks/useLogsQuery';

export function useLogs(fetchFn: (filters: LogFilters) => Promise<Log[]>) {
  const { filters, filterHandlers } = useLogFilters();

  const { logs, isLoading, error } = useLogsQuery(fetchFn, filters);

  return {
    logs,
    isLoading,
    error,
    filters,
    ...filterHandlers,
  };
}
