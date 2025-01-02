'use client';
import { useEffect, useState } from 'react';
import { ModAction } from '@/services/logs-manager';
import { Log } from '@/types/logs';

type LogState = {
  logs: Log[];
  isLoading: boolean;
  error: string | null;
  filters: {
    action?: ModAction | null;
    performedBy?: string;
    targetUser?: string;
    targetPost?: string;
    dateRange?: { fromDate: string; toDate: string };
    sortBy: 'ascending' | 'descending';
  };
};

export const useLogs = (fetchLogs: () => Promise<Log[]>) => {
  const [state, setState] = useState<LogState>({
    logs: [],
    isLoading: true,
    error: null,
    filters: {
      sortBy: 'descending',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const data = await fetchLogs();
        setState((prev) => ({
          ...prev,
          logs: data,
          isLoading: false,
        }));
      } catch (err) {
        console.error(err);
        setState((prev) => ({
          ...prev,
          error: 'Failed to load moderation logs',
          isLoading: false,
        }));
      }
    };

    fetchData();
  }, [state.filters]);

  const onDateFilterChange = (range: { fromDate: string; toDate: string }) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        dateRange: range,
      },
    }));
  };

  const onActionFilterChange = (action: ModAction) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        action: action || null,
      },
    }));
  };

  const onPerformedByFilterChange = (performedBy: string) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        performedBy,
      },
    }));
  };

  const onTargetUserFilterChange = (targetUser: string) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        targetUser,
      },
    }));
  };

  const onTargetPostFilterChange = (targetPost: string) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        targetPost,
      },
    }));
  };

  const onSortByFilterChange = (sortBy: 'ascending' | 'descending') => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        sortBy,
      },
    }));
  };

  const onClearFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: {
        sortBy: 'descending',
      },
    }));
  };

  return {
    ...state,
    onDateFilterChange,
    onActionFilterChange,
    onPerformedByFilterChange,
    onTargetUserFilterChange,
    onTargetPostFilterChange,
    onSortByFilterChange,
    onClearFilters,
  };
};
