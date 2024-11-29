import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AtprotoAgent } from './atproto-agent';

export interface FeedParams {
  did: string;
  feedName: string;
  limit?: number;
  cursor?: string;
  signal?: AbortSignal; // Allow signal for cancellation
}

export interface FeedResponse {
  feed: FeedViewPost[];
  cursor?: string;
}

export const fetchFeed = async ({
  did,
  feedName,
  limit = 50,
  cursor,
  signal,
}: FeedParams): Promise<FeedResponse | { error: Error['message'] }> => {
  try {
    const { data } = await AtprotoAgent.app.bsky.feed.getFeed(
      {
        feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
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
