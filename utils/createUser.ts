import { User } from '@/types/user';
import { AppBskyActorDefs } from '@atproto/api';

export function createUser(
  profile: AppBskyActorDefs.ProfileViewDetailed
): User {
  return {
    did: profile.did,
    handle: profile.handle,
    name: profile.displayName || profile.handle,
    avatar: profile.avatar || null,
    associated: profile.associated,
    labels: profile.labels,
    role: 'user',
  };
}
