import { User } from '@/types/user';
import { type AppBskyActorDefs } from '@atproto/api';

// User type

// Create a user
export function createUser(data: AppBskyActorDefs.ProfileViewDetailed): User {
  return {
    did: data.did,
    handle: data.handle,
    name: data.displayName || data.handle,
    avatar: data.avatar || null,
    associated: data.associated,
    labels: data.labels || [],
  };
}
