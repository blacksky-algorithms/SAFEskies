import { useEffect, useState } from 'react';
import { Log, LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { fetchLogs } from '@/lib/utils/logs';
import { useSearchParams } from 'next/navigation';
import { userCanViewAdminActions } from '@/lib/utils/permission';
import { useProfileData } from '@/hooks/useProfileData';
import { User } from '@/lib/types/user';

export function useLogs() {
  const searchParams = useSearchParams();
  const { profile } = useProfileData();

  const [state, setState] = useState<{
    logs: Log[];
    isLoading: boolean;
    error: string | null;
    userCanViewAdminActions: boolean;
  }>({
    logs: [],
    isLoading: true,
    error: null,
    userCanViewAdminActions: false,
  });

  useEffect(() => {
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
    const fetchData = async () => {
      if (!profile) {
        return;
      }
      const canViewAdminActions = userCanViewAdminActions(profile as User);
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const filters = getFiltersFromParams();
        const logs = await fetchLogs(filters);

        setState({
          logs,
          isLoading: false,
          error: null,
          userCanViewAdminActions: canViewAdminActions,
        });
      } catch (err) {
        console.error('Error fetching logs:', err);
        setState({
          logs: [],
          isLoading: false,
          error: 'Failed to fetch logs',
          userCanViewAdminActions: false,
        });
      }
    };

    fetchData();
  }, [searchParams, profile]);

  return {
    ...state,
  };
}
