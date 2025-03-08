import { Log, LogFilters } from '@/lib/types/logs';

/**
 * Fetches logs.
 */
export async function fetchLogs(filters: LogFilters): Promise<Log[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    if (key === 'dateRange' && value.fromDate && value.toDate) {
      params.set('fromDate', value.fromDate);
      params.set('toDate', value.toDate);
    } else {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/logs?${params.toString()}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch logs');
  }

  const data = await response.json();
  return data.logs;
}
