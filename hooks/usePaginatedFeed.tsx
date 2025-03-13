import { useReducer, useEffect, useRef, useCallback } from 'react';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { useSearchParams } from 'next/navigation';

type FeedState = {
  feed: FeedViewPost[];
  cursor?: string;
  isFetching: boolean;
  hasNextPage: boolean;
  error: string | null;
  uri: string | null;
};

type FeedAction =
  | { type: 'URI_CHANGE'; payload: string | null }
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: { feed: FeedViewPost[]; cursor?: string };
    }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'REFRESH_FEED' }
  | { type: 'RESET_ERROR' };

const initialState: FeedState = {
  feed: [],
  cursor: undefined,
  isFetching: false,
  hasNextPage: true,
  error: null,
  uri: null,
};

// Move reducer to a separate function for clarity
function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'URI_CHANGE':
      return { ...state, uri: action.payload };
    case 'FETCH_START':
      return { ...state, isFetching: true, error: null };
    case 'FETCH_SUCCESS':
      // Deduplicate posts using a Map
      return {
        ...state,
        feed: Array.from(
          new Map(
            [...state.feed, ...action.payload.feed].map((item) => [
              item.post.cid,
              item,
            ])
          ).values()
        ),
        cursor: action.payload.cursor,
        hasNextPage: !!action.payload.cursor,
        isFetching: false,
        error: null,
      };
    case 'FETCH_ERROR':
      return { ...state, isFetching: false, error: action.payload };
    case 'REFRESH_FEED':
      return { ...state, feed: [], cursor: undefined, hasNextPage: true };
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface UsePaginatedFeedParams {
  limit?: number;
  uri?: string;
}

export function usePaginatedFeed(
  options: UsePaginatedFeedParams | undefined = {}
) {
  const limit = options.limit || 10;
  const [state, dispatch] = useReducer(feedReducer, initialState);
  const cursorRef = useRef(state.cursor);

  const searchParams = useSearchParams();
  const uri = options.uri ?? searchParams.get('uri');
  // Keep cursor reference updated
  useEffect(() => {
    cursorRef.current = state.cursor;
  }, [state.cursor]);

  useEffect(() => {
    dispatch({ type: 'URI_CHANGE', payload: uri });
  }, [uri]);

  const fetchFeedData = useCallback(
    async (refresh = false) => {
      if (!uri) return;
      if (refresh) dispatch({ type: 'REFRESH_FEED' });
      dispatch({ type: 'FETCH_START' });

      try {
        const params = new URLSearchParams({
          uri,
          limit: limit.toString(),
        });

        if (!refresh && cursorRef.current) {
          params.set('cursor', cursorRef.current);
        }

        const response = await fetch(`/api/feed?${params}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch feed');
        }

        const data = await response.json();
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { feed: data.feed, cursor: data.cursor },
        });
      } catch (error: unknown) {
        dispatch({
          type: 'FETCH_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to fetch feed',
        });
      }
    },
    [limit, uri]
  );

  // Reset and fetch when uri changes
  useEffect(() => {
    fetchFeedData(true);
  }, [uri, fetchFeedData]);

  const fetchNextPage = useCallback(() => {
    if (!state.hasNextPage || state.isFetching) return;
    fetchFeedData();
  }, [fetchFeedData, state.hasNextPage, state.isFetching]);

  const refreshFeed = useCallback(() => {
    fetchFeedData(true);
  }, [fetchFeedData]);

  return {
    ...state,
    fetchNextPage,
    refreshFeed,
  };
}
