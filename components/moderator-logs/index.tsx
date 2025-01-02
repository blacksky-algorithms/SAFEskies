'use client';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Logs } from '../logs';
import { useLogs } from '@/hooks/useLogs';
import { LogsManager } from '@/services/logs-manager';

export const ModeratorLogs = ({
  feedUri,
  targetedProfile,
}: {
  feedUri: string;
  targetedProfile?: ProfileViewBasic;
}) => {
  const {
    logs,
    isLoading,
    error,
    filters,
    onDateFilterChange,
    onActionFilterChange,
    onSortByFilterChange,
    onClearFilters,
  } = useLogs(() => LogsManager.getFeedModerationLogs(feedUri, filters));

  const categories = {
    all: logs,
    posts: logs.filter((postLog) =>
      ['post_delete', 'post_restore'].includes(postLog.action)
    ),
    bans: logs.filter((banLog) =>
      ['user_ban', 'user_unban'].includes(banLog.action)
    ),
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
      isLoading={isLoading}
      error={error}
    />
  );
};
