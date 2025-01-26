import { SupabaseInstance } from '@/repos/supabase';
import { BaseLog, LogEntry, LogFilters } from '@/lib/types/logs';
import { getBulkProfileDetails } from '@/repos/profile';
import { getDateTimeRange } from '@/lib/utils/logs';

export async function getRawLogs(filters: LogFilters): Promise<BaseLog[]> {
  let query = SupabaseInstance.from('moderation_logs').select('*');

  if (filters.feedUri) {
    query = query.eq('feed_uri', filters.feedUri);
  }

  if (filters.action) {
    query = query.eq('action', filters.action);
  }

  if (filters.performedBy?.trim()) {
    query = query.eq('performed_by', filters.performedBy.trim());
  }

  if (filters.targetUser?.trim()) {
    query = query.eq('target_user_did', filters.targetUser.trim());
  }

  if (filters.targetPost?.trim()) {
    query = query.eq('target_post_uri', filters.targetPost.trim());
  }

  if (filters.dateRange) {
    const { fromDateTime, toDateTime } = getDateTimeRange(filters.dateRange);
    query = query.gte('created_at', fromDateTime).lte('created_at', toDateTime);
  }

  query = query.order('created_at', {
    ascending: filters.sortBy === 'ascending',
  });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }

  return data;
}

export async function getLogs(filters: LogFilters): Promise<BaseLog[]> {
  const rawLogs = await getRawLogs(filters);

  // Filter out null values when collecting DIDs
  const dids = new Set(
    rawLogs
      .flatMap((log) => [log.performed_by, log.target_user_did])
      .filter((did): did is string => did !== null)
  );

  const profiles = await getBulkProfileDetails(Array.from(dids));
  const profileMap = new Map(profiles.map((p) => [p.did, p]));

  return rawLogs.map((log) => ({
    ...log,
    performed_by_profile: profileMap.get(log.performed_by) || {
      did: log.performed_by,
      handle: log.performed_by,
    },
    target_user_profile: log.target_user_did
      ? profileMap.get(log.target_user_did)
      : undefined,
  }));
}

export async function createLog(
  entry:
    | Omit<LogEntry, 'id' | 'created_at'>
    | Omit<BaseLog, 'id' | 'created_at'>
) {
  const { error } = await SupabaseInstance.from('moderation_logs').insert(
    entry
  );

  if (error) throw error;
}
