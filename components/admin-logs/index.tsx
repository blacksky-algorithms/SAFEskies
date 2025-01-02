'use client';

import { useEffect, useState } from 'react';
import { LogsManager, ModAction } from '@/services/logs-manager';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';
import { Log } from '@/types/logs';
import { Logs } from '../logs';
import { User } from '@/types/user';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

type AdminLogState = {
  logs: Log[];
  moderators: ProfileViewBasic[];
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

interface AdminLogsProps {
  user: User | null;
}

export const AdminLogs = ({ user }: AdminLogsProps) => {
  const [state, setState] = useState<AdminLogState>({
    logs: [],
    moderators: [],
    isLoading: true,
    error: null,
    filters: {
      action: null,
      sortBy: 'descending',
    },
  });

  // Load moderators on mount
  useEffect(() => {
    const fetchModerators = async () => {
      if (!user?.did) return;

      try {
        const mods = await FeedPermissionManager.getAllModeratorsForAdmin(
          user.did
        );
        setState((prev) => ({
          ...prev,
          moderators: mods,
        }));
      } catch (err) {
        console.error('Error fetching moderators:', err);
      }
    };

    fetchModerators();
  }, [user?.did]);

  // Fetch logs when filters change
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const data = await LogsManager.getAdminLogs(state.filters);
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

    fetchLogs();
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
        action: null,
        performedBy: '',
        targetUser: '',
        targetPost: '',
        dateRange: undefined,
        sortBy: 'descending',
      },
    }));
  };

  const categories = {
    all: state.logs,
    posts: state.logs.filter((postLog) =>
      ['post_delete', 'post_restore'].includes(postLog.action)
    ),
    bans: state.logs.filter((banLog) =>
      ['user_ban', 'user_unban'].includes(banLog.action)
    ),
  };
  console.log(state.moderators);
  return (
    <Logs
      categories={categories}
      onActionFilterChange={onActionFilterChange}
      onDateFilterChange={onDateFilterChange}
      onPerformedByFilterChange={onPerformedByFilterChange}
      onTargetUserFilterChange={onTargetUserFilterChange}
      onTargetPostFilterChange={onTargetPostFilterChange}
      onSortByFilterChange={onSortByFilterChange}
      onClearFilters={onClearFilters}
      filters={state.filters}
      isLoading={state.isLoading}
      error={state.error}
      moderators={state.moderators}
    />
  );
};
