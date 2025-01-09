'use client';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Logs } from '@/components/logs';
import { useLogs } from '@/hooks/useLogs';
import { fetchLogs } from '@/lib/utils/logs';

export const ModeratorLogs = ({
  feedUri,
  targetedProfile,
}: {
  feedUri: string;
  targetedProfile?: ProfileViewBasic;
}) => {
  const { logs, isLoading, error, filters, ...filterHandlers } = useLogs(
    fetchLogs,
    'feed',
    feedUri
  );

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
      error={error}
      targetedProfile={targetedProfile}
    />
  );
};
