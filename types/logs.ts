import { ModAction } from '@/services/logs-manager';

export interface Log {
  id: string;
  feed_did: string;
  action: ModAction;
  created_at: string;
  performed_by: string;
  performed_by_profile: {
    handle: string;
    name: string | null;
  };
  target_user_did: string | null;
  target_user_profile?: {
    handle: string;
    name: string | null;
  };
  target_post_uri: string | null;
  metadata: Record<string, unknown> | null;
}
