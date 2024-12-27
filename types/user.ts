import { AppBskyActorDefs, ComAtprotoLabelDefs } from '@atproto/api';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export interface FeedRoleInfo {
  role: UserRole;
  displayName: string;
  feedUri: string;
}

export type UserRole = 'admin' | 'mod' | 'user';

export interface User extends ProfileViewBasic {
  rolesByFeed: Record<string, FeedRoleInfo>;
}
