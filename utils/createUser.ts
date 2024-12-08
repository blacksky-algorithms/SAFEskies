import { type ComAtprotoLabelDefs, type AppBskyActorDefs } from '@atproto/api';

// User type
export type User = {
  did: string;
  handle: string;
  name: string;
  avatar: string | null;
  associated?: AppBskyActorDefs.ProfileAssociated;
  labels?: ComAtprotoLabelDefs.Label[];
};

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
