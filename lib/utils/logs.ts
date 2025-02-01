import { Log, LogFilters } from '@/lib/types/logs';

export async function fetchLogs(
  filters: LogFilters,
  type: 'admin' | 'feed' = 'admin',
  feedUri?: string
): Promise<Log[]> {
  const params = new URLSearchParams({ type });
  console.log('filters', { filters });

  if (type === 'feed' && feedUri) {
    params.set('feedUri', feedUri);
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    if (key === 'dateRange') {
      params.set('fromDate', value.fromDate);
      params.set('toDate', value.toDate);
    } else {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/logs?${params}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch logs');
  }

  const data = await response.json();
  return data.logs;
}

export function getDateTimeRange(dateRange: {
  fromDate: string;
  toDate: string;
}) {
  const fromDateTime = `${dateRange.fromDate} 00:00:00.000+00`;
  const toDateTime = `${dateRange.toDate} 23:59:59.999+00`;
  return { fromDateTime, toDateTime };
}
