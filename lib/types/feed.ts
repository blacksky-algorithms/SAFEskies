import { GeneratorView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export interface FeedState {
  feeds: GeneratorView[];
  error: string | null;
  isLoading: boolean;
}
