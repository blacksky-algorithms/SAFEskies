'use client';

import { Logs } from '../';
import { useLogs } from '@/hooks/useLogs';

interface AdminLogsProps {
  uri: string;
}

export function FeedLogs({ uri }: AdminLogsProps) {
  const { logs, isLoading, error, filters, updateFilter, clearFilters } =
    useLogs({ uri });

  return (
    <Logs
      logs={logs}
      isLoading={isLoading}
      error={error}
      filters={filters}
      updateFilter={updateFilter}
      clearFilters={clearFilters}
    />
  );
}
