import { FeedParams, fetchFeed } from '@/repos/feed-repo';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface FeedState {
  feed: any[];
  cursor?: string;
  isFetching: boolean;
  hasNextPage: boolean;
  error: Error | null;
}

export const usePaginatedFeed = ({
  did,
  feedName,
  limit = 50,
}: Omit<FeedParams, 'cursor' | 'signal'>) => {
  const [state, setState] = useState<FeedState>({
    feed: [],
    cursor: undefined,
    isFetching: false,
    hasNextPage: true,
    error: null,
  });

  const updateState = (partialState: Partial<FeedState>) => {
    setState((prevState) => ({ ...prevState, ...partialState }));
  };

  const fetchNextPage = useCallback(async () => {
    const { hasNextPage, isFetching, cursor, feed } = state;
    if (!hasNextPage || isFetching) return;

    updateState({ isFetching: true });

    try {
      const { feed: newFeed, cursor: newCursor } = await fetchFeed({
        did,
        feedName,
        limit,
        cursor,
      });

      const uniqueFeed = Array.from(
        new Map(
          [...feed, ...newFeed].map((item) => [item.post.cid, item])
        ).values()
      );

      updateState({
        feed: uniqueFeed,
        cursor: newCursor,
        hasNextPage: !!newCursor,
        error: null,
      });
    } catch (error) {
      updateState({ error: error as Error });
    } finally {
      updateState({ isFetching: false });
    }
  }, [state, did, feedName, limit]);

  const refreshFeed = useCallback(async () => {
    updateState({ isFetching: true, error: null });

    try {
      const { feed: freshFeed, cursor: newCursor } = await fetchFeed({
        did,
        feedName,
        limit,
      });

      const uniqueFeed = Array.from(
        new Map(freshFeed.map((item) => [item.post.cid, item])).values()
      );

      updateState({
        feed: uniqueFeed,
        cursor: newCursor,
        hasNextPage: !!newCursor,
        error: null,
      });
    } catch (error) {
      updateState({ error: error as Error });
    } finally {
      updateState({ isFetching: false });
    }
  }, [did, feedName, limit]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const initializeFeed = async () => {
      updateState({
        feed: [],
        cursor: undefined,
        isFetching: true,
        hasNextPage: true,
        error: null,
      });

      try {
        const { feed: initialFeed, cursor: initialCursor } = await fetchFeed({
          did,
          feedName,
          limit,
          signal,
        });

        const uniqueFeed = Array.from(
          new Map(initialFeed.map((item) => [item.post.cid, item])).values()
        );

        updateState({
          feed: uniqueFeed,
          cursor: initialCursor,
          isFetching: false,
          hasNextPage: !!initialCursor,
          error: null,
        });
      } catch (error) {
        if (signal.aborted) return; // Ignore abort errors
        updateState({ error: error as Error });
      } finally {
        updateState({ isFetching: false });
      }
    };

    initializeFeed();

    return () => controller.abort();
  }, [did, feedName, limit]);

  return {
    feed: [],
    error: {
      error: 'UpstreamFailure',
      headers: {
        'content-length': '56',
        'content-type': 'application/json; charset=utf-8',
      },
      success: false,
      status: 502,
    },
    isFetching: false,
    hasNextPage: false,
    fetchNextPage: () => {},
    refreshFeed: () => {},
  };

  return useMemo(
    () => ({
      feed: state.feed,
      error: state.error,
      isFetching: state.isFetching,
      hasNextPage: state.hasNextPage,
      fetchNextPage,
      refreshFeed,
    }),
    [state, fetchNextPage, refreshFeed]
  );
};
