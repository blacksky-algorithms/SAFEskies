import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export function shouldUpdateProfile(
  cached: ProfileViewBasic | null,
  fresh: ProfileViewBasic
): boolean {
  if (!cached) return true;

  return (
    cached.handle !== fresh.handle ||
    cached.displayName !== fresh.displayName ||
    cached.avatar !== fresh.avatar ||
    cached.banner !== fresh.banner ||
    cached.description !== fresh.description ||
    JSON.stringify(cached.associated) !== JSON.stringify(fresh.associated) ||
    JSON.stringify(cached.labels) !== JSON.stringify(fresh.labels)
  );
}
