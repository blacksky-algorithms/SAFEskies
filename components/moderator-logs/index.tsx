'use client';

import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Logs } from '../logs';
import { useLogs } from '@/hooks/useLogs';

interface ModeratorLogsProps {
  feedUri: string;
  targetedProfile?: ProfileViewBasic;
}

export function ModeratorLogs({
  feedUri,
  targetedProfile,
}: ModeratorLogsProps) {
  const { logs, isLoading, error, filters, updateFilter, clearFilters } =
    useLogs('feed', feedUri);
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
      isLoading={isLoading}
      error={error}
      filters={filters}
      updateFilter={updateFilter}
      clearFilters={clearFilters}
    />
  );
}
