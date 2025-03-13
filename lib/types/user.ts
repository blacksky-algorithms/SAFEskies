import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { UserRole } from '@/lib/types/permission';

export interface FeedRoleInfo {
  type: UserRole;
  displayName: string;
  uri: string;
}

export interface User extends ProfileViewBasic {
  rolesByFeed: FeedRoleInfo[];
}
