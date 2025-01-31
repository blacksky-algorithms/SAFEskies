'use client';

import { Logs } from '../logs';
import { User } from '@/lib/types/user';
import { useLogs } from '@/hooks/useLogs';

interface AdminLogsProps {
  user: User;
}

export function AdminLogs({ user }: AdminLogsProps) {
  const { logs, isLoading, error, filters, updateFilter, clearFilters } =
    useLogs();
  console.log({ user });

  return (
    <Logs
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
