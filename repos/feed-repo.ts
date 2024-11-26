import useSWRInfinite from 'swr/infinite';
import { AtprotoAgent } from './atproto-agent';

// Types
export interface FeedParams {
  did: string;
  feedName: string;
  limit?: number;
  cursor?: string;
}

export interface FeedResponse {
  feed: any[];
  cursor?: string; // Add cursor for pagination
}

// Fetcher function
export const fetchFeed = async ({
  did,
  feedName,
  limit = 10,
  cursor,
}: FeedParams): Promise<FeedResponse> => {
  try {
    console.log('Fetching Feed:', { did, feedName, limit, cursor });

    const { data } = await AtprotoAgent.app.bsky.feed.getFeed({
      feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
      limit,
      cursor,
    });

    console.log('Fetched Feed Data:', data);
    return { feed: data.feed, cursor: data.cursor };
  } catch (error) {
    console.error('Error in fetchFeed:', error);
    throw error;
  }
};
