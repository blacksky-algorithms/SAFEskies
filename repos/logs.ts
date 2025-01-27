import { SupabaseInstance } from '@/repos/supabase';
import { Log, LogEntry, LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { getBulkProfileDetails } from '@/repos/profile';
import { getDateTimeRange } from '@/lib/utils/logs';
import { AtprotoAgent } from './atproto-agent';

export async function getRawLogs(filters: LogFilters): Promise<Log[]> {
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

async function fetchTargetUserProfile(did: string) {
  try {
    const response = await AtprotoAgent.app.bsky.actor.getProfile({
      actor: did,
    });

    if ('success' in response) {
      return {
        did: response.data.did,
        handle: response.data.handle,
        name: response.data.displayName,
        avatar: response.data.avatar,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching target user profile:', error);
    return null;
  }
}

export async function getLogs(filters: LogFilters): Promise<Log[]> {
  const rawLogs = await getRawLogs(filters);

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

export async function createModerationLog(
  entry: Omit<LogEntry, 'id' | 'created_at'> | Omit<Log, 'id' | 'created_at'>
) {
  const { error } = await SupabaseInstance.from('moderation_logs').insert(
    entry
  );

  if (error) throw error;
}

export const getFeedModerationLogs = async (
  feedUri: string,
  filters?: {
    action?: ModAction | null;
    performedBy?: string;
    targetUser?: string;
    targetPost?: string;
    dateRange?: {
      fromDate: string;
      toDate: string;
    };
    sortBy?: 'ascending' | 'descending';
  }
) => {
  let query = SupabaseInstance.from('moderation_logs')
    .select(
      `
     *,
     performed_by_profile:profiles!performed_by(handle, name)
   `
    )
    .eq('feed_uri', feedUri);

  if (filters) {
    const { action, performedBy, targetPost, dateRange } = filters;

    if (action) {
      query = query.in('action', [action]);
    }
    if (performedBy?.trim()) {
      query = query.ilike(
        'performed_by_profile.handle',
        `%${performedBy.trim()}%`
      );
    }
    if (targetPost?.trim()) {
      query = query.ilike('target_post_uri', `%${targetPost.trim()}%`);
    }
    if (dateRange) {
      const { fromDateTime, toDateTime } = getDateTimeRange(dateRange);
      query = query
        .gte('created_at', fromDateTime)
        .lte('created_at', toDateTime);
    }
  }

  const { data, error } = await query.order('created_at', {
    ascending: filters?.sortBy === 'ascending',
  });

  if (error) {
    console.error('Error fetching moderation logs:', error.message);
    throw error;
  }

  const enrichedData = await Promise.all(
    data.map(async (log) => {
      if (log.target_user_did) {
        const targetProfile = await fetchTargetUserProfile(log.target_user_did);
        return {
          ...log,
          target_user_profile: targetProfile,
        };
      }
      return log;
    })
  );

  return enrichedData;
};

export const getActionLogs = async (feedUri: string, action: ModAction) => {
  const { data, error } = await SupabaseInstance.from('moderation_logs')
    .select(
      `
     *, 
     performed_by_profile:profiles!performed_by(handle, name)
   `
    )
    .eq('feed_uri', feedUri)
    .eq('action', action)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const enrichedData = await Promise.all(
    data.map(async (log) => {
      if (log.target_user_did) {
        const targetProfile = await fetchTargetUserProfile(log.target_user_did);
        return {
          ...log,
          target_user_profile: targetProfile,
        };
      }
      return log;
    })
  );

  return enrichedData;
};

export const getAdminLogs = async (filters?: {
  action?: ModAction | null;
  performedBy?: string;
  targetUser?: string;
  targetPost?: string;
  dateRange?: {
    fromDate: string;
    toDate: string;
  };
  sortBy: 'ascending' | 'descending';
}) => {
  let query = SupabaseInstance.from('moderation_logs')
    .select(
      `
     *,
     performed_by_profile:profiles!performed_by(
       did,
       handle,
       name,
       avatar
     )
   `
    )
    .not('performed_by_profile', 'is', null);

  if (filters) {
    const { action, performedBy, targetPost, dateRange } = filters;

    if (action) {
      query = query.in('action', [action]);
    }

    if (performedBy?.trim()) {
      query = query.ilike(
        'performed_by_profile.handle',
        `%${performedBy.trim()}%`
      );
    }

    if (targetPost?.trim()) {
      query = query.ilike('target_post_uri', `%${targetPost.trim()}%`);
    }

    if (dateRange) {
      const { fromDateTime, toDateTime } = getDateTimeRange(dateRange);
      query = query
        .gte('created_at', fromDateTime)
        .lte('created_at', toDateTime);
    }
  }

  const { data, error } = await query.order('created_at', {
    ascending: filters?.sortBy === 'ascending',
  });

  if (error) {
    console.error('Error fetching admin logs:', error.message);
    throw error;
  }

  const enrichedData = await Promise.all(
    data
      .filter((log) => log.performed_by_profile?.handle)
      .map(async (log) => {
        if (log.target_user_did) {
          const targetProfile = await fetchTargetUserProfile(
            log.target_user_did
          );
          return {
            ...log,
            target_user_profile: targetProfile,
          };
        }
        return log;
      })
  );

  return enrichedData;
};
