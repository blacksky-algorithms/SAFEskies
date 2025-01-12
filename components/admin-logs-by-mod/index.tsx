'use client';

import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Logs } from '../logs';
import { useLogs } from '@/hooks/useLogs';

interface ModeratorLogsProps {
  feedUri: string;
  targetedProfile?: ProfileViewBasic;
}

export function AdminLogsByMod({
  feedUri,
  targetedProfile,
}: ModeratorLogsProps) {
  const { logs, isLoading, error, filters, updateFilter, clearFilters } =
    useLogs('feed', feedUri);

  return (
    <Logs
      targetedProfile={targetedProfile}
      logs={logs}
      isLoading={isLoading}
      error={error}
      filters={filters}
      updateFilter={updateFilter}
      clearFilters={clearFilters}
      isAdmin
    />
  );
}
