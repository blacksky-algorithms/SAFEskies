import { useState, useEffect, useRef } from 'react';
import { FeedParams, fetchFeed } from '@/repos/feed-repo';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

interface FeedState {
  feed: FeedViewPost[];
  cursor?: string;
  isFetching: boolean;
  hasNextPage: boolean;
  error: string | null;
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

  // Initialize or abort the fetch controller
  const initializeController = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
  };

  // Handle the response from fetchFeed
  const handleFetchResponse = async (
    response: Awaited<ReturnType<typeof fetchFeed>>
  ) => {
    if ('error' in response) {
      // Ignore AbortError; handle other errors
      if (response.error !== 'AbortError') {
        setState((prevState) => ({
          ...prevState,
          error: response.error,
          isFetching: false,
        }));
      } else {
        setState((prevState) => ({ ...prevState, isFetching: false }));
      }
      return;
    }

    const { feed: newFeed, cursor: newCursor } = response;

    // Deduplicate feed items by `post.cid`
    const uniqueFeed = Array.from(
      new Map(
        [...state.feed, ...newFeed].map((item) => [item.post.cid, item])
      ).values()
    );

    setState((prevState) => ({
      ...prevState,
      feed: uniqueFeed,
      cursor: newCursor,
      hasNextPage: !!newCursor,
      isFetching: false,
      error: null,
    }));
  };

  // Fetch the next page of the feed
  const fetchNextPage = async () => {
    if (!state.hasNextPage || state.isFetching) return;

    initializeController();
    setState((prevState) => ({ ...prevState, isFetching: true }));

    const response = await fetchFeed({
      did,
      feedName,
      limit,
      cursor: state.cursor,
      signal: controllerRef.current?.signal,
    });

    handleFetchResponse(response);
  };

  // Refresh the feed
  const refreshFeed = async () => {
    initializeController();
    setState((prevState) => ({
      ...prevState,
      isFetching: true,
      error: null,
    }));

    const response = await fetchFeed({
      did,
      feedName,
      limit,
      signal: controllerRef.current?.signal,
    });

    handleFetchResponse(response);
  };

  // Initialize the feed on mount or when `did`/`feedName`/`limit` changes
  useEffect(() => {
    initializeController();

    const initializeFeed = async () => {
      setState({
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
        signal: controllerRef.current?.signal,
      });

      handleFetchResponse(response);
    };

    initializeFeed();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [did, feedName, limit]);

  return {
    feed: state.feed,
    error: state.error,
    isFetching: state.isFetching,
    hasNextPage: state.hasNextPage,
    fetchNextPage,
    refreshFeed,
  };
};
