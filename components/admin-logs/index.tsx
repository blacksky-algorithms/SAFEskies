'use client';
import { useEffect, useState } from 'react';
import { Logs } from '../logs';
import { User } from '@/lib/types/user';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useLogs } from '@/hooks/useLogs';
import { fetchLogs, fetchModerators } from './utils';

interface AdminLogsProps {
  user: User | null;
}

export const AdminLogs = ({ user }: AdminLogsProps) => {
  const [moderators, setModerators] = useState<ProfileViewBasic[]>([]);
  const [moderatorError, setModeratorError] = useState<string | null>(null);

  const { logs, isLoading, error, filters, ...filterHandlers } =
    useLogs(fetchLogs);

  useEffect(() => {
    if (!user?.did) return;

    async function loadModerators() {
      try {
        const moderatorData = await fetchModerators();
        setModerators(moderatorData);
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
      {...filterHandlers}
      filters={filters}
      isLoading={isLoading}
      error={error || moderatorError}
      moderators={moderators}
    />
  );
};
