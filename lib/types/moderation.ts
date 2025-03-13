import { PostRecord } from '@atproto/api';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { User } from './user';

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

export interface ReportData {
  targetedPostUri?: string;
  reason: string;
  toServices: { label: string; value: string }[];
  targetedUserDid?: string;
  uri: string;
  feedName?: string;
  additionalInfo?: string;
  action: ModAction;
  targetedPost?: PostRecord;
  targetedProfile?: User;
}

export interface ModerationService {
  value: 'blacksky' | 'ozone';
  label: 'Blacksky Moderation Service' | 'Ozone Moderation Service';
  admin_did: string | null;
}
