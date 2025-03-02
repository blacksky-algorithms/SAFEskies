import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export type UserRole = 'admin' | 'mod' | 'user';

export type FeedRoleInfo = {
  type: UserRole;
  displayName: string;
  uri: string;
};

export type ModeratorWithProfile = ProfileViewBasic & { type: UserRole };

export type FeedWithModerators = {
  feed: Feed;
  moderators: ModeratorWithProfile[];
};

export type FeedPermission = {
  role: UserRole;
  uri: string;
  feed_name: string;
  user_did: string;
  created_by?: string;
  created_at?: string;
};
