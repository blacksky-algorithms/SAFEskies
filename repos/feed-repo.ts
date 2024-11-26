import { AtprotoAgent } from './atproto-agent';

export interface FeedParams {
  did: string;
  feedName: string;
  limit?: number;
  cursor?: string;
  signal?: AbortSignal; // Allow signal for cancellation
}

export interface FeedResponse {
  feed: any[];
  cursor?: string;
}

export const fetchFeed = async ({
  did,
  feedName,
  limit = 50,
  cursor,
  signal,
}: FeedParams): Promise<FeedResponse> => {
  const { data } = await AtprotoAgent.app.bsky.feed.getFeed(
    {
      feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
      limit,
      cursor,
    },
    { signal } // Pass signal to the request options
  );

  return { feed: data.feed, cursor: data.cursor };
};
