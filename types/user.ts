import { AppBskyActorDefs, ComAtprotoLabelDefs } from '@atproto/api';

// types/user.ts
export type UserRole = 'admin' | 'mod' | 'user';

export interface UserPermissions {
  globalRole: UserRole;
  feedPermissions: {
    feedDid: string;
    feedName: string;
    role: UserRole;
  }[];
}

export interface User {
  did: string;
  handle: string;
  name: string;
  avatar: string | null;
  associated?: AppBskyActorDefs.ProfileAssociated;
  labels?: ComAtprotoLabelDefs.Label[];
  permissions?: UserPermissions;
  role?: UserRole;
}
