import { User } from '@/types/user';
import { AppBskyActorDefs } from '@atproto/api';

export function createUser(data: AppBskyActorDefs.ProfileViewDetailed): User {
  return {
    did: data.did,
    handle: data.handle,
    name: data.displayName || 'Anonymous',
    avatar: data.avatar || null,
    associated: data.associated,
    labels: data.labels || [],
  };
}
