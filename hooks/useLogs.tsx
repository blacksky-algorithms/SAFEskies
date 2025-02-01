import { useEffect, useState } from 'react';
import { Log, LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { fetchLogs } from '@/lib/utils/logs';
import { useSearchParams } from 'next/navigation';

export function useLogs() {
  const searchParams = useSearchParams();

  const [state, setState] = useState<{
    logs: Log[];
    isLoading: boolean;
    error: string | null;
  }>({
    logs: [],
    isLoading: true,
    error: null,
  });

  // Helper to construct the filters object from search params
  const getFiltersFromParams = (): LogFilters => {
    const params = Object.fromEntries(searchParams.entries());

    return {
      action: (params.action as ModAction) || null,
      performedBy: params.performedBy,
      targetUser: params.targetUser,
      targetPost: params.targetPost,
      sortBy: (params.sortBy as 'ascending' | 'descending') || 'descending',
      dateRange:
        params.fromDate && params.toDate
          ? { fromDate: params.fromDate, toDate: params.toDate }
          : undefined,
      feedUri: params.uri,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const filters = getFiltersFromParams();
        const logs = await fetchLogs(filters);

        setState({ logs, isLoading: false, error: null });
      } catch (err) {
        console.error('Error fetching logs:', err);
        setState({ logs: [], isLoading: false, error: 'Failed to fetch logs' });
      }
    };

    fetchData();
  }, [searchParams]);

  return {
    ...state,
  };
}
