import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FeedParams, fetchFeed } from '@/repos/feed-repo';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

interface FeedState {
  feed: FeedViewPost[];
  cursor?: string;
  isFetching: boolean;
  hasNextPage: boolean;
  error: string | null; // Updated to reflect the error type from `fetchFeed`
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

  // Process the fetch response
  const handleFetchResponse = (
    response: Awaited<ReturnType<typeof fetchFeed>>
  ) => {
    if ('error' in response) {
      // Check if error is actionable (not AbortError)
      if (response.error !== 'AbortError') {
        updateState({ error: response.error, isFetching: false });
      } else {
        updateState({ isFetching: false });
      }
      return;
    }

    const { feed: newFeed, cursor: newCursor } = response;

    const uniqueFeed = Array.from(
      new Map(
        [...state.feed, ...newFeed].map((item) => [item.post.cid, item])
      ).values()
    );

    updateState({
      feed: uniqueFeed,
      cursor: newCursor,
      hasNextPage: !!newCursor,
      isFetching: false,
      error: null,
    });
  };

  const fetchNextPage = useCallback(async () => {
    const { hasNextPage, isFetching, cursor } = state;
    if (!hasNextPage || isFetching) return;

    abortOngoingRequest();
    const signal = controllerRef.current?.signal;

    updateState({ isFetching: true });

    const response = await fetchFeed({
      did,
      feedName,
      limit,
      cursor,
      signal,
    });

    handleFetchResponse(response);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, did, feedName, limit]);

  const refreshFeed = useCallback(async () => {
    abortOngoingRequest();
    const signal = controllerRef.current?.signal;

    updateState({ isFetching: true, error: null });

    const response = await fetchFeed({
      did,
      feedName,
      limit,
      signal,
    });

    handleFetchResponse(response);
  }, [did, feedName, handleFetchResponse, limit]);

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

      const response = await fetchFeed({
        did,
        feedName,
        limit,
        signal: controller.signal,
      });

      handleFetchResponse(response);
    };

    initializeFeed();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
