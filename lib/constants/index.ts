import { UserRole } from '@/lib/types/permission';

export const CONTENT_LABELS = ['porn', 'sexual', 'nudity', 'graphic-media'];

export const preferredLanguages = 'en-US, en';

export const DEFAULT_FEED = {
  uri: 'at://did:plc:w4xbfzo7kqfes5zb7r6qv3rw/app.bsky.feed.generator/blacksky',
  displayName: 'Blacksky',
  type: 'user' as UserRole,
} as const;
