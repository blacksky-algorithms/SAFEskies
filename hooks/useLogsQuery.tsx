import { LogFilters, Log } from '@/lib/types/logs';
import { useState, useRef, useEffect } from 'react';

export const useLogsQuery = (
  fetchFn: (filters: LogFilters) => Promise<Log[]>,
  filters: LogFilters
) => {
  const [state, setState] = useState<{
    logs: Log[];
    isLoading: boolean;
    error: string | null;
  }>({
    logs: [],
    isLoading: true,
    error: null,
  });

  // Using ref to avoid unnecessary rerenders
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const data = await fetchFn(filtersRef.current);

        if (isMounted) {
          setState({
            logs: data,
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
  }, [fetchFn, filters]);

  return state;
};
