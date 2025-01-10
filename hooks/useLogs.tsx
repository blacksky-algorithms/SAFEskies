import { useEffect, useRef, useState } from 'react';
import { AdminLog, LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { fetchLogs } from '@/lib/utils/logs';

type FilterUpdate = Partial<Pick<LogFilters, keyof LogFilters>>;

export function useLogs(type: 'admin' | 'feed' = 'admin', feedUri?: string) {
  const [filters, setFilters] = useState<LogFilters>({
    sortBy: 'descending',
  });
  const [state, setState] = useState<{
    logs: AdminLog[];
    isLoading: boolean;
    error: string | null;
  }>({
    logs: [],
    isLoading: true,
    error: null,
  });

  const filtersRef = useRef(filters);
  console.log('LogFilters', filters);

  const updateStateAndRef = (newFilter: FilterUpdate) => {
    const updatedState = { ...filters, ...newFilter };
    setFilters(updatedState);
    filtersRef.current = updatedState;
  };

  const filterUpdaters = {
    updateAction: (action: ModAction) =>
      updateStateAndRef({ action: action || null }),

    updateDateRange: (dateRange: { fromDate: string; toDate: string }) =>
      updateStateAndRef({ dateRange }),

    updatePerformedBy: (performedBy: string) =>
      updateStateAndRef({ performedBy }),

    updateTargetUser: (targetUser: string) => updateStateAndRef({ targetUser }),

    updateTargetPost: (targetPost: string) => updateStateAndRef({ targetPost }),

    updateSortBy: (sortBy: 'ascending' | 'descending') => {
      updateStateAndRef({ sortBy });
    },

    clearFilters: () => updateStateAndRef({ sortBy: 'descending' }),
  };

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const logs = await fetchLogs(filtersRef.current, type, feedUri);

        if (isMounted) {
          setState({
            logs,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setState({
            logs: [],
            isLoading: false,
            error: 'Failed to load moderation logs',
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [filters, type, feedUri]);

  return {
    ...state,
    filterUpdaters,
    filters,
  };
}
