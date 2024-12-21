import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AtprotoAgent } from './atproto-agent';

export interface FeedParams {
  limit?: number;
  cursor?: string;
  signal?: AbortSignal; // Allow signal for cancellation
  uri: string;
}

export interface FeedResponse {
  feed: FeedViewPost[];
  cursor?: string;
}

export const fetchFeed = async ({
  limit = 50,
  cursor,
  signal,
  uri,
}: FeedParams): Promise<FeedResponse | { error: Error['message'] }> => {
  try {
    const { data } = await AtprotoAgent.app.bsky.feed.getFeed(
      {
        feed: uri,
        limit,
        cursor,
      },
      { signal }
    );
    return { feed: data.feed, cursor: data.cursor };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: 'Unknown error' };
    }
  }
};
