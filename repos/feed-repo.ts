import useSWR, { SWRResponse } from 'swr';
import { AtprotoAgent } from './atproto-agent';

// Types
export interface FeedParams {
  did: string;
  feedName: string;
  limit?: number;
}

export interface FeedResponse {
  feed: any[]; // Replace `any` with proper type for feed items
}

// Fetcher function
const fetchFeed = async ({
  did,
  feedName,
  limit,
}: FeedParams): Promise<FeedResponse> => {
  const { data } = await AtprotoAgent.app.bsky.feed.getFeed({
    feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
    limit,
  });
  console.log(data);
  return { feed: data.feed };
};

// Custom hook
export const useFeed = (params: FeedParams): SWRResponse<FeedResponse> => {
  const { did, feedName, limit = 50 } = params;

  // Use SWR for caching and revalidation
  return useSWR<FeedResponse>(
    ['feed', did, feedName, limit], // Cache key
    () => fetchFeed({ did, feedName, limit }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000, // Avoid refetching too often
    }
  );
};
