import { SupabaseInstance } from '@/repos/supabase';

export type ModAction =
  | 'post_delete'
  | 'post_restore'
  | 'user_ban'
  | 'user_unban'
  | 'mod_promote'
  | 'mod_demote';

export interface LogEntry {
  feed_uri: string;
  performed_by: string;
  action: ModAction;
  target_post_uri?: string;
  target_user_did?: string;
  metadata?: Record<string, unknown>;
}

const createModerationLog = async (entry: LogEntry) => {
  const { error } = await SupabaseInstance.from('moderation_logs').insert(
    entry
  );

  if (error) throw error;
};

const getFeedModerationLogs = async (
  feedUri: string,
  filters?: {
    actions?: ModAction[];
    performedBy?: string;
    targetUser?: string;
    targetPost?: string;
    dateRange?: {
      fromDate: string;
      toDate: string;
    };
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
    const { actions, performedBy, targetUser, targetPost, dateRange } = filters;

    if (actions && actions.length > 0) {
      query = query.in('action', actions);
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
      const { fromDate, toDate } = dateRange;

      const fromDateTime = `${fromDate}T00:00:00Z`;
      const toDateTime = `${toDate}T23:59:59Z`;

      query = query
        .gte('created_at', fromDateTime)
        .lte('created_at', toDateTime);
    }
  }

  // Order results by creation date
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching moderation logs:', error.message);
    throw error;
  }

  return data;
};

const getActionLogs = async (feedUri: string, action: ModAction) => {
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

export const ModerationLogs = {
  createModerationLog,
  getFeedModerationLogs,
  getActionLogs,
};
