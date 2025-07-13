import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchFeed } from '@/repos/feeds';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

/**
 * usePaginatedFeed hook
 *
 * Fetches and manages an infinite/paginated feed using cursor-based pagination.
 * It uses a refresh counter in the query key to force a reinitialization of the query when refreshed.
 * The hook deduplicates posts based on their URI.
 *
 * @param options - Configuration options:
 *  - limit: Number of posts per page (default: 10)
 *  - uri: Feed URI; if not provided, the URI is obtained from the URL search parameters.
 * @returns An object with:
 *  - feed: Array of deduplicated feed posts.
 *  - isFetching: Whether the feed is currently fetching data.
 *  - isFetchingNextPage: Whether the next page is being fetched.
 *  - hasNextPage: Boolean indicating if more pages are available.
 *  - error: Any error encountered during fetching.
 *  - refreshFeed: Function to refresh the feed.
 *  - fetchNextPage: Function to load the next page.
 */
export function usePaginatedFeed(
  options: { limit?: number; uri?: string } = {}
) {
  const searchParams = useSearchParams();
  const limit = options.limit || 10;
  const uri = options.uri ?? searchParams.get('uri');

  // Refresh counter forces reinitialization of the query
  const [refreshCount, setRefreshCount] = useState(0);

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['feed', uri, limit, refreshCount],
    queryFn: async ({ pageParam }) => {
      if (!uri) throw new Error('URI is required');
      const result = await fetchFeed({
        uri,
        limit,
        cursor: pageParam as string | undefined,
      });
      if ('error' in result) {
        throw new Error(result.error);
      }
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: '',
    enabled: !!uri,
    refetchOnWindowFocus: false,
  });

  // Flatten and deduplicate posts using post.uri; memoized to avoid unnecessary recomputations.
  const flattenedFeed = useMemo(() => {
    if (!infiniteQuery.data) return [];
    const seenUris = new Set<string>();
    return infiniteQuery.data.pages.flatMap((page) =>
      page.feed.filter((item) => {
        if (seenUris.has(item.post.uri)) {
          return false;
        }
        seenUris.add(item.post.uri);
        return true;
      })
    );
  }, [infiniteQuery.data]);

  // Refresh by incrementing the refresh counter.
  const refreshFeed = useCallback(async () => {
    setRefreshCount((prev) => prev + 1);
  }, []);

  const fetchNextPage = useCallback(() => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    infiniteQuery.hasNextPage,
    infiniteQuery.isFetchingNextPage,
    infiniteQuery.fetchNextPage,
  ]);

  return {
    feed: flattenedFeed,
    isFetching: infiniteQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: !!infiniteQuery.hasNextPage,
    error: infiniteQuery.error,
    refreshFeed,
    fetchNextPage,
  };
}

/**
 * useHasNewPosts: Monitors for posts that are newer than those in your current feed.
 *
 * It polls the feed (typically the first page) and compares the post URIs with your current feed.
 * Polling is disabled while fetching is in progress to reduce performance overhead.
 *
 * @param options - Configuration options including uri, limit, pollingInterval, currentFeed, and isFetching.
 * @returns Boolean indicating if new posts are available.
 */
export function useHasNewPosts(options: {
  uri: string | null;
  limit?: number;
  pollingInterval?: number;
  currentFeed: FeedViewPost[];
  isFetching: boolean;
}): boolean {
  const { currentFeed, isFetching, uri } = options;
  const limit = options.limit || 10;
  const pollingInterval = options.pollingInterval || 10000;

  const [hasNewPosts, setHasNewPosts] = useState(false);

  // Polling query: will be disabled when the main feed is fetching
  const pollQuery = useQuery({
    queryKey: ['feed-poll', uri],
    queryFn: () => {
      if (!uri) throw new Error('URI is required');
      return fetchFeed({ uri, limit });
    },
    refetchInterval: pollingInterval,
    enabled: !!uri && !isFetching && !hasNewPosts, // disable polling while fetching
    select: (data) => ('feed' in data ? data.feed : []),
  });

  useEffect(() => {
    if (
      !currentFeed ||
      currentFeed.length === 0 ||
      !pollQuery.data ||
      pollQuery.data.length === 0
    ) {
      return;
    }
    // Use post.uri for deduplication/ comparison.
    const currentUris = new Set(currentFeed.map((item) => item.post.uri));
    const newPostsDetected = pollQuery.data.some(
      (item) => !currentUris.has(item.post.uri)
    );
    setHasNewPosts((prev) =>
      prev !== newPostsDetected ? newPostsDetected : prev
    );
  }, [currentFeed, pollQuery.data]);

  // Reset the flag when the first post in the current feed changes,
  // which generally indicates that a refresh has occurred.
  useEffect(() => {
    setHasNewPosts(false);
  }, [currentFeed[0]?.post.uri]);

  return hasNewPosts;
}
