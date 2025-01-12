'use client';

import { useEffect, useState } from 'react';
import { Logs } from '../logs';
import { User } from '@/lib/types/user';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useLogs } from '@/hooks/useLogs';

interface AdminLogsProps {
  user: User | null;
}

export function AdminLogs({ user }: AdminLogsProps) {
  const [modActors, setModActors] = useState<ProfileViewBasic[]>([]);
  const [moderatorError, setModeratorError] = useState<string | null>(null);

  const { logs, isLoading, error, filters, updateFilter, clearFilters } =
    useLogs();

  useEffect(() => {
    if (!user?.did) return;

    async function loadModerators() {
      try {
        const response = await fetch('/api/moderators');
        if (!response.ok) {
          throw new Error('Failed to fetch moderators');
        }
        const data = await response.json();
        setModActors(data.moderators);
        setModeratorError(null);
      } catch (error) {
        console.error('Error fetching moderators:', error);
        setModeratorError(
          error instanceof Error ? error.message : 'Failed to fetch moderators'
        );
      }
    }

    loadModerators();
  }, [user?.did]);

  // Group logs by category - memoize if performance becomes an issue
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
      categories={categories}
      isLoading={isLoading}
      error={error || moderatorError}
      modActors={modActors}
      filters={filters}
      updateFilter={updateFilter}
      clearFilters={clearFilters}
    />
  );
}
