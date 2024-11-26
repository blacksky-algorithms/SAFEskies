import { FeedParams, fetchFeed } from '@/repos/feed-repo';
import { useState, useEffect } from 'react';

export const usePaginatedFeed = ({
  did,
  feedName,
  limit = 50,
}: Omit<FeedParams, 'cursor'>) => {
  const [feed, setFeed] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNextPage = async () => {
    if (!hasNextPage || isFetching) return;

    setIsFetching(true);
    try {
      const { feed: newFeed, cursor: newCursor } = await fetchFeed({
        did,
        feedName,
        limit,
        cursor,
      });

      console.log('Fetched Next Page:', { newFeed, newCursor });

      setFeed((prevFeed) => {
        const mergedFeed = [...prevFeed, ...newFeed];
        const uniqueFeed = Array.from(
          new Map(mergedFeed.map((item) => [item.post.cid, item])).values()
        );
        return uniqueFeed;
      });
      setCursor(newCursor);
      setHasNextPage(!!newCursor);
    } catch (err) {
      console.error('Error fetching next page:', err);
      setError(err as Error);
    } finally {
      setIsFetching(false);
    }
  };

  const refreshFeed = async () => {
    setIsFetching(true);
    try {
      const { feed: freshFeed, cursor: newCursor } = await fetchFeed({
        did,
        feedName,
        limit,
      });

      console.log('Refreshed Feed:', { freshFeed, newCursor });

      setFeed(freshFeed);
      setCursor(newCursor);
      setHasNextPage(!!newCursor);
    } catch (err) {
      console.error('Error refreshing feed:', err);
      setError(err as Error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const initializeFeed = async () => {
      setIsFetching(true);
      try {
        const { feed: initialFeed, cursor: initialCursor } = await fetchFeed({
          did,
          feedName,
          limit,
        });

        console.log('Initialized Feed:', { initialFeed, initialCursor });

        setFeed(
          Array.from(
            new Map(initialFeed.map((item) => [item.post.cid, item])).values()
          )
        );
        setCursor(initialCursor);
        setHasNextPage(!!initialCursor);
      } catch (err) {
        console.error('Error initializing feed:', err);
        setError(err as Error);
      } finally {
        setIsFetching(false);
      }
    };

    initializeFeed();
  }, [did, feedName, limit]);

  return {
    feed,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    refreshFeed,
  };
};
