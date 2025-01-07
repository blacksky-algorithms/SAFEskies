import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { UserRole } from '@/lib/types/permission';

export interface FeedRoleInfo {
  role: UserRole;
  displayName: string;
  feedUri: string;
}

export interface User extends ProfileViewBasic {
  rolesByFeed: Record<string, FeedRoleInfo>;
}

export interface ModeratorData {
  user_did: string;
  feed_uri: string;
  feed_name: string;
  role: UserRole;
  profiles: ProfileViewBasic;
}
