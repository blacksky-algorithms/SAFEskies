import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FeedParams, fetchFeed } from '@/repos/feed-repo';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

interface FeedState {
  feed: FeedViewPost[];
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

  const controllerRef = useRef<AbortController | null>(null);

  const updateState = (partialState: Partial<FeedState>) => {
    setState((prevState) => ({ ...prevState, ...partialState }));
  };

  // Abort any ongoing fetch
  const abortOngoingRequest = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
  };

  const fetchNextPage = useCallback(async () => {
    const { hasNextPage, isFetching, cursor, feed } = state;
    if (!hasNextPage || isFetching) return;

    abortOngoingRequest();
    const signal = controllerRef.current?.signal;

    updateState({ isFetching: true });

    try {
      const { feed: newFeed, cursor: newCursor } = await fetchFeed({
        did,
        feedName,
        limit,
        cursor,
        signal,
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
      if ((error as Error).name !== 'AbortError') {
        updateState({ error: error as Error });
      }
    } finally {
      if (!signal?.aborted) {
        updateState({ isFetching: false });
      }
    }
  }, [state, did, feedName, limit]);

  const refreshFeed = useCallback(async () => {
    abortOngoingRequest();
    const signal = controllerRef.current?.signal;

    updateState({ isFetching: true, error: null });

    try {
      const { feed: freshFeed, cursor: newCursor } = await fetchFeed({
        did,
        feedName,
        limit,
        signal,
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
      if ((error as Error).name !== 'AbortError') {
        updateState({ error: error as Error });
      }
    } finally {
      if (!signal?.aborted) {
        updateState({ isFetching: false });
      }
    }
  }, [did, feedName, limit]);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

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
          signal: controller.signal,
        });

        const uniqueFeed = Array.from(
          new Map(initialFeed.map((item) => [item.post.cid, item])).values()
        );

        updateState({
          feed: uniqueFeed,
          cursor: initialCursor,
          hasNextPage: !!initialCursor,
          error: null,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          updateState({ error: error as Error });
        }
      } finally {
        if (!controller.signal.aborted) {
          updateState({ isFetching: false });
        }
      }
    };

    initializeFeed();

    return () => controller.abort(); // Abort on unmount
  }, [did, feedName, limit]);

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
