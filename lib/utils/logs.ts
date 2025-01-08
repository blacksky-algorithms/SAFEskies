import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { LogFilters, Log } from '@/lib/types/logs';

export const getDateTimeRange = (dateRange: {
  fromDate: string;
  toDate: string;
}) => {
  const fromDateTime = `${dateRange.fromDate}T00:00:00.000Z`;
  const toDateTime = `${dateRange.toDate}T23:59:59.999Z`;

  return { fromDateTime, toDateTime };
};

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
