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
    action: ModAction | null;
    dateRange: { fromDate: string; toDate: string };
    sortBy: 'ascending' | 'descending';
  };
};

export const ModeratorLogs = ({
  feedUri,
  targetedProfile,
}: {
  feedUri: string;
  targetedProfile?: ProfileViewBasic;
}) => {
  const [filters, setFilters] = useState<{
    action?: ModAction | null;
    dateRange?: { fromDate: string; toDate: string };
    sortBy?: 'ascending' | 'descending';
  }>({});

  const [state, setState] = useState<ModeratorLogState>({
    logs: [],
    isLoading: true,
    error: null,
    filters: {
      action: null,
      dateRange: { fromDate: '', toDate: '' },
      sortBy: 'descending',
    },
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await LogsManager.getFeedModerationLogs(feedUri, filters);
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
  }, [feedUri, filters]);

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
    setFilters((prev) => ({
      ...prev,
      dateRange: range || undefined,
    }));
  };

  const onActionFilterChange = (val: ModAction) => {
    if (!val) {
      setFilters((prev) => ({
        ...prev,
        action: null,
      }));
      return;
    }
    setFilters((prev) => ({
      ...prev,
      action: val,
    }));
  };

  const onSortByFilterChange = (val: 'ascending' | 'descending') => {
    setFilters((prev) => ({
      ...prev,
      sortBy: val,
    }));
  };

  const onClearFilters = () => {
    setFilters({
      action: null,
      dateRange: { fromDate: '', toDate: '' },
      sortBy: 'descending',
    });
  };

  return (
    <Logs
      targetedProfile={targetedProfile}
      categories={categories}
      onActionFilterChange={onActionFilterChange}
      onDateFilterChange={onDateFilterChange}
      onSortByFilterChange={onSortByFilterChange}
      onClearFilters={onClearFilters}
      filters={filters}
      isLoading={state.isLoading}
      error={state.error}
    />
  );
};
