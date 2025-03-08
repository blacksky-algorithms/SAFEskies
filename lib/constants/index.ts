import { UserRole } from '@/lib/types/permission';

export const CONTENT_LABELS = ['porn', 'sexual', 'nudity', 'graphic-media'];

export const preferredLanguages = 'en-US, en';

export const DEFAULT_FEED = {
  uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
  displayName: "What's Hot",
  type: 'user' as UserRole,
} as const;
