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
  const { data } = await AtprotoAgent.app.bsky.feed.getFeed({
    feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
    limit,
    cursor,
  });

  return { feed: data.feed, cursor: data.cursor };
};

// Paginated SWR Hook
export const usePaginatedFeed = ({
  did,
  feedName,
  limit = 10,
}: Omit<FeedParams, 'cursor'>) => {
  const getKey = (pageIndex: number, previousPageData: FeedResponse | null) => {
    if (previousPageData && !previousPageData.cursor) return null; // No more pages
    const cursor = previousPageData?.cursor || undefined;
    return [did, feedName, limit, cursor]; // Key includes pagination state
  };

  const { data, error, size, setSize, isValidating } =
    useSWRInfinite<FeedResponse>(
      getKey,
      ([did, feedName, limit, cursor]) =>
        fetchFeed({
          did,
          feedName,
          limit: Number(limit),
          cursor,
        }),
      {
        revalidateOnFocus: false, // Avoid unnecessary refetching on focus
        dedupingInterval: 500, // Avoid frequent duplicate requests
      }
    );

  // Flatten all pages into a single array
  const feed = data ? data.flatMap((page) => page.feed) : [];
  const hasNextPage = data && data[data.length - 1]?.cursor; // Check if more pages exist

  // Fetch the next page
  const fetchNextPage = () => {
    if (hasNextPage) setSize(size + 1); // Increment the page sizåe
  };

  return {
    feed,
    error,
    isFetching: isValidating,
    hasNextPage: !!hasNextPage,
    fetchNextPage,
  };
};
