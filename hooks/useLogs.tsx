import { useEffect, useRef, useState } from 'react';
import { Log, LogFilters } from '@/lib/types/logs';
import { fetchLogs } from '@/lib/utils/logs';

type FilterUpdate = Partial<Pick<LogFilters, keyof LogFilters>>;

export function useLogs({
  uri,
  targetUser,
  performedBy,
  sortBy = 'descending',
}: {
  uri?: string;
  targetUser?: string;
  performedBy?: string;
  sortBy?: 'ascending' | 'descending';
}) {
  const [filters, setFilters] = useState<LogFilters>({
    sortBy,
    feedUri: uri,
    targetUser: targetUser || undefined,
    performedBy: performedBy || undefined,
  });
  console.log('filters', filters);
  const [state, setState] = useState<{
    logs: Log[];
    isLoading: boolean;
    error: string | null;
  }>({
    logs: [],
    isLoading: true,
    error: null,
  });

  const filtersRef = useRef(filters);

  const updateStateAndRef = (newFilter: FilterUpdate) => {
    const updatedState = { ...filters, ...newFilter };
    setFilters(updatedState);
    filtersRef.current = updatedState;
  };

  const clearFilters = () => {
    const initialFilters = {
      sortBy,
      feedUri: uri,
      targetUser: targetUser || undefined,
      performedBy: performedBy || undefined,
    };
    setFilters(initialFilters);
    filtersRef.current = initialFilters;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const logs = await fetchLogs(filtersRef.current);

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
  }, [filters]);

  return {
    ...state,
    filters,
    updateFilter: updateStateAndRef,
    clearFilters,
  };
}
