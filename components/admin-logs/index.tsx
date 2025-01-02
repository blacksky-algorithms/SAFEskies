'use client';
import { useEffect, useState } from 'react';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';
import { Logs } from '../logs';
import { User } from '@/types/user';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useLogs } from '@/hooks/useLogs';
import { LogsManager } from '@/services/logs-manager';

interface AdminLogsProps {
  user: User | null;
}

export const AdminLogs = ({ user }: AdminLogsProps) => {
  const [moderators, setModerators] = useState<ProfileViewBasic[]>([]);

  const {
    logs,
    isLoading,
    error,
    filters,
    onDateFilterChange,
    onActionFilterChange,
    onPerformedByFilterChange,
    onTargetUserFilterChange,
    onTargetPostFilterChange,
    onSortByFilterChange,
    onClearFilters,
  } = useLogs(() => LogsManager.getAdminLogs(filters));

  useEffect(() => {
    const fetchModerators = async () => {
      if (!user?.did) return;

      try {
        const mods = await FeedPermissionManager.getAllModeratorsForAdmin(
          user.did
        );
        setModerators(mods);
      } catch (err) {
        console.error('Error fetching moderators:', err);
      }
    };

    fetchModerators();
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
      onActionFilterChange={onActionFilterChange}
      onDateFilterChange={onDateFilterChange}
      onPerformedByFilterChange={onPerformedByFilterChange}
      onTargetUserFilterChange={onTargetUserFilterChange}
      onTargetPostFilterChange={onTargetPostFilterChange}
      onSortByFilterChange={onSortByFilterChange}
      onClearFilters={onClearFilters}
      filters={filters}
      isLoading={isLoading}
      error={error}
      moderators={moderators}
    />
  );
};
