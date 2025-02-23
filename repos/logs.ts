import { SupabaseInstance } from '@/repos/supabase';
import { Log, LogEntry, LogFilters } from '@/lib/types/logs';
import { getBulkProfileDetails } from '@/repos/profile';
import { getDateTimeRange } from '@/lib/utils/logs';

/**
 * Applies filters to the query based on the provided LogFilters.
 * It will only apply a filter if the value is not null/undefined and (if a string) not empty.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyFiltersToQuery = (query: any, filters: LogFilters) => {
  // Mapping filter keys to database column names
  const fieldMapping: Array<{ key: keyof LogFilters; column: string }> = [
    { key: 'uri', column: 'uri' },
    { key: 'action', column: 'action' },
    { key: 'performedBy', column: 'performed_by' },
    { key: 'targetUser', column: 'target_user_did' },
    { key: 'targetPost', column: 'target_post_uri' },
  ];

  for (const { key, column } of fieldMapping) {
    const value = filters[key];
    // Only apply the filter if the value is not null/undefined.
    // For strings, also check that it's not just whitespace.
    if (
      value !== undefined &&
      value !== null &&
      (!(typeof value === 'string') || value.trim() !== '')
    ) {
      query = query.eq(
        column,
        typeof value === 'string' ? value.trim() : value
      );
    }
  }

  // Apply the date range filter if provided
  if (filters.dateRange) {
    const { fromDateTime, toDateTime } = getDateTimeRange(filters.dateRange);
    query = query.gte('created_at', fromDateTime).lte('created_at', toDateTime);
  }

  // Apply ordering based on sortBy
  query = query.order('created_at', {
    ascending: filters.sortBy === 'ascending',
  });

  return query;
};

/**
 * Retrieves raw logs from Supabase after applying the given filters.
 */
export async function getRawLogs(filters: LogFilters): Promise<Log[]> {
  const query = applyFiltersToQuery(
    SupabaseInstance.from('moderation_logs').select('*'),
    filters
  );
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
  return data;
}

/**
 * Enriches an array of logs with profile details by bulk-fetching the profiles.
 */
const enrichLogsWithProfiles = async (logs: Log[]): Promise<Log[]> => {
  const dids = Array.from(
    new Set(
      logs
        .flatMap((log) => [log.performed_by, log.target_user_did])
        .filter((did): did is string => Boolean(did))
    )
  );
  const profiles = await getBulkProfileDetails(dids);
  const profileMap = new Map(profiles.map((p) => [p.did, p]));

  return logs.map((log) => ({
    ...log,
    performed_by_profile: profileMap.get(log.performed_by) || {
      did: log.performed_by,
      handle: log.performed_by,
    },
    target_user_profile: log.target_user_did
      ? profileMap.get(log.target_user_did)
      : undefined,
  }));
};

/**
 * Retrieves logs using the provided filters and enriches them with profile data.
 */
export async function getLogs(filters: LogFilters): Promise<Log[]> {
  const rawLogs = await getRawLogs(filters);
  return enrichLogsWithProfiles(rawLogs);
}

/**
 * Inserts a new moderation log entry into Supabase.
 */
export async function createModerationLog(
  entry: Omit<LogEntry, 'id' | 'created_at'> | Omit<Log, 'id' | 'created_at'>
) {
  const { error } = await SupabaseInstance.from('moderation_logs').insert(
    entry
  );
  if (error) throw error;
}

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
