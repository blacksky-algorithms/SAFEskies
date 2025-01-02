'use client';
import { useEffect, useState } from 'react';
import { LogsManager, ModAction } from '@/services/logs-manager';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Log } from '@/types/logs';
import { Logs } from '../logs';

type ModeratorLogState = {
  logs: Log[];
  isLoading: boolean;
  error: string | null;
  filters: {
    action?: ModAction | null;
    dateRange?: { fromDate: string; toDate: string };
    sortBy?: 'ascending' | 'descending';
  };
};

export const ModeratorLogs = ({
  feedUri,
  targetedProfile,
}: {
  feedUri: string;
  targetedProfile?: ProfileViewBasic;
}) => {
  const [state, setState] = useState<ModeratorLogState>({
    logs: [],
    isLoading: true,
    error: null,
    filters: {},
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await LogsManager.getFeedModerationLogs(
          feedUri,
          state.filters
        );
        setState((prevState) => ({ ...prevState, logs: data }));
      } catch (err) {
        console.error(err);
        setState((prevState) => ({
          ...prevState,
          error: 'Failed to load moderation logs',
        }));
      } finally {
        setState((prevState) => ({ ...prevState, isLoading: false }));
      }
    };

    fetchLogs();
  }, [feedUri, state.filters]);

  const categories = {
    all: state.logs,
    posts: state.logs.filter((postLog) =>
      ['post_delete', 'post_restore'].includes(postLog.action)
    ),
    bans: state.logs.filter((banLog) =>
      ['user_ban', 'user_unban'].includes(banLog.action)
    ),
  };

  const onDateFilterChange = (range: { fromDate: string; toDate: string }) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        dateRange: range || undefined,
      },
    }));
  };

  const onActionFilterChange = (val: ModAction) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        action: val || null,
      },
    }));
  };

  const onSortByFilterChange = (val: 'ascending' | 'descending') => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        sortBy: val,
      },
    }));
  };

  const onClearFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: {},
    }));
  };

  return (
    <Logs
      targetedProfile={targetedProfile}
      categories={categories}
      onActionFilterChange={onActionFilterChange}
      onDateFilterChange={onDateFilterChange}
      onSortByFilterChange={onSortByFilterChange}
      onClearFilters={onClearFilters}
      filters={state.filters}
      isLoading={state.isLoading}
      error={state.error}
    />
  );
};
