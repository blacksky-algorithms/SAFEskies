import { ModAction } from '@/lib/types/moderation';
import { UserRole } from '@/lib/types/permission';

export interface Log {
  id: string;
  action: ModAction;
  created_at: string;
  feed_uri: string;
  performed_by: string;
  performed_by_profile: {
    did: string;
    avatar?: string;
    handle: string;
    name: string | null;
  };
  target_user_did: string | null;
  target_user_profile?: {
    did: string;
    avatar?: string;
    handle: string;
    name: string | null;
  };
  target_post_uri: string | null;
  // TODO: reshape this
  metadata: { feed_name?: string; role: UserRole } | null;
}

export interface LogEntry {
  feed_uri: string;
  performed_by: string;
  action: ModAction;
  target_post_uri?: string;
  target_user_did?: string;
  metadata?: Record<string, unknown>;
}

export interface LogFilters {
  action?: ModAction | null;
  performedBy?: string;
  targetUser?: string;
  targetPost?: string;
  dateRange?: { fromDate: string; toDate: string };
  sortBy: 'ascending' | 'descending';
}
