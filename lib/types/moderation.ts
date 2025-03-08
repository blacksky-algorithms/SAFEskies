import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';

export interface PromoteModState {
  selectedUser: ProfileViewBasic | null;
  selectedFeeds: Feed[];
  disabledFeeds: string[];
  isLoading: boolean;
  error: string | null;
}

export type ModAction =
  | 'post_delete'
  | 'post_restore'
  | 'user_ban'
  | 'user_unban'
  | 'mod_promote'
  | 'mod_demote';

export interface ReportOption {
  id: string;
  title: string;
  description: string;
  reason: string;
}
