import { ModAction } from '@/lib/types/moderation';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export interface Log {
  id: string;
  uri: string;
  performed_by: string;
  action: ModAction;
  target_post_uri: string | null;
  target_user_did: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // TODO: Add these fields to the LogEntry type
  ip_address?: string | null;
  user_agent?: string | null;
  performed_by_profile: ProfileViewBasic;
  target_user_profile?: ProfileViewBasic;
}

export interface LogFilters {
  action?: ModAction | null;
  performedBy?: string;
  targetUser?: string;
  targetPost?: string;
  dateRange?: { fromDate: string; toDate: string };
  sortBy: 'ascending' | 'descending';
  uri?: string;
}
export interface LogEntry {
  id: string;
  uri: string;
  performed_by: string;
  action: ModAction;
  target_post_uri?: string | null;
  target_user_did: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // TODO: Add these fields to the LogEntry type
  ip_address?: string | null;
  user_agent?: string | null;
}
