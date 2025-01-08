import { LogEntry } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { getDateTimeRange } from '@/lib/utils/logs';
import { SupabaseInstance } from '@/repos/supabase';

export const createModerationLog = async (entry: LogEntry) => {
  const { error } = await SupabaseInstance.from('moderation_logs').insert(
    entry
  );

  if (error) throw error;
};

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
  // Base query
  let query = SupabaseInstance.from('moderation_logs')
    .select(
      `
      *,
      performed_by_profile:profiles!performed_by(handle, name),
      target_user_profile:profiles!target_user_did(handle, name)
    `
    )
    .eq('feed_uri', feedUri);

  // Apply filters if provided
  if (filters) {
    const { action, performedBy, targetUser, targetPost, dateRange } = filters;

    if (action) {
      query = query.in('action', [action]);
    }
    if (performedBy?.trim()) {
      query = query.ilike(
        'performed_by_profile.handle',
        `%${performedBy.trim()}%`
      );
    }
    if (targetUser?.trim()) {
      query = query.ilike(
        'target_user_profile.handle',
        `%${targetUser.trim()}%`
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

  // Order results by creation date
  const { data, error } = await query.order('created_at', {
    ascending: filters?.sortBy === 'ascending',
  });

  if (error) {
    console.error('Error fetching moderation logs:', error.message);
    throw error;
  }

  return data;
};

export const getActionLogs = async (feedUri: string, action: ModAction) => {
  const { data, error } = await SupabaseInstance.from('moderation_logs')
    .select(
      `
      *, 
      performed_by_profile:profiles!performed_by(handle, name),
      target_user_profile:profiles!target_user_did(handle, name)
    `
    )
    .eq('feed_uri', feedUri)
    .eq('action', action)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
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
  // Base query ensuring we get all required profile data
  let query = SupabaseInstance.from('moderation_logs')
    .select(
      `
      *,
      performed_by_profile:profiles!moderation_logs_performed_by_fkey(
        did,
        handle,
        name,
        avatar
      ),
      target_user_profile:profiles!moderation_logs_target_user_did_fkey(
        did,
        handle,
        name,
        avatar
      )
    `
    )
    .not('performed_by_profile', 'is', null);

  // Apply filters if provided
  if (filters) {
    const { action, performedBy, targetUser, targetPost, dateRange } = filters;

    if (action) {
      query = query.in('action', [action]);
    }

    if (performedBy?.trim()) {
      query = query.ilike(
        'performed_by_profile.handle',
        `%${performedBy.trim()}%`
      );
    }

    if (targetUser?.trim()) {
      query = query.ilike(
        'target_user_profile.handle',
        `%${targetUser.trim()}%`
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

  // Order results by creation date
  const { data, error } = await query.order('created_at', {
    ascending: filters?.sortBy === 'ascending',
  });

  if (error) {
    console.error('Error fetching admin logs:', error.message);
    throw error;
  }

  // Only return logs where we have all required profile data
  return data.filter(
    (log) =>
      log.performed_by_profile?.handle &&
      (!log.target_user_did || log.target_user_profile?.handle)
  );
};
