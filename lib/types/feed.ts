import { GeneratorView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { ModeratorWithProfile } from '@/lib/types/permission';

export interface FeedState {
  feeds: GeneratorView[];
  error: string | null;
  isLoading: boolean;
}
export type FeedWithModerators = {
  feed: Feed;
  moderators: ModeratorWithProfile[];
};
