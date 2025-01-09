import { LogFilters, Log } from '@/lib/types/logs';
import { useLogFilters } from '@/hooks/useLogFilters';
import { useLogsQuery } from '@/hooks/useLogsQuery';

export function useLogs(
  fetchFn: (
    filters: LogFilters,
    type?: 'admin' | 'feed',
    feedUri?: string
  ) => Promise<Log[]>,
  type: 'admin' | 'feed' = 'admin',
  feedUri?: string
) {
  const { filters, filterHandlers } = useLogFilters();

  const { logs, isLoading, error } = useLogsQuery(
    fetchFn,
    filters,
    type,
    feedUri
  );

  return {
    logs,
    isLoading,
    error,
    filters,
    ...filterHandlers,
  };
}
