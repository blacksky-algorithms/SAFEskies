import { Log, LogFilters } from '@/lib/types/logs';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export const buildLogQueryParams = (filters: LogFilters): URLSearchParams => {
  const params = new URLSearchParams({
    type: 'admin',
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    if (key === 'dateRange') {
      const dateRange = value as { fromDate: string; toDate: string };
      params.set('fromDate', dateRange.fromDate);
      params.set('toDate', dateRange.toDate);
    } else {
      params.set(key, String(value));
    }
  });

  return params;
};

export const fetchLogs = async (filters: LogFilters): Promise<Log[]> => {
  const params = buildLogQueryParams(filters);
  const response = await fetch(`/api/logs?${params}`);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch logs');
  }

  const data = await response.json();
  return data.logs;
};

export const fetchModerators = async (): Promise<ProfileViewBasic[]> => {
  const response = await fetch('/api/moderators');

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch moderators');
  }

  const data = await response.json();
  return data.moderators;
};
