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
    actions: ModAction[];
    dateRange: { fromDate: string; toDate: string };
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
    actions?: ModAction[];
    dateRange?: { fromDate: string; toDate: string };
  }>({});

  const [state, setState] = useState<ModeratorLogState>({
    logs: [],
    isLoading: true,
    error: null,
    filters: {
      actions: [],
      dateRange: { fromDate: '', toDate: '' },
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

  const onActionFilterChange = (val: string) => {
    if (!val) {
      setFilters((prev) => ({
        ...prev,
        actions: [],
      }));
      return;
    }
    setFilters((prev) => ({
      ...prev,
      actions: [val as ModAction],
    }));
  };

  return (
    <Logs
      targetedProfile={targetedProfile}
      categories={categories}
      onActionFilterChange={onActionFilterChange}
      onDateFilterChange={onDateFilterChange}
      filters={filters}
      isLoading={state.isLoading}
      error={state.error}
    />
  );
};
