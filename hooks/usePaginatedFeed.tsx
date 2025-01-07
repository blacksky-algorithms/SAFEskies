import { useReducer, useEffect, useRef, useCallback } from 'react';
import { FeedParams, fetchFeed } from '@/repos/feeds';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

type FeedState = {
  feed: FeedViewPost[];
  cursor?: string;
  isFetching: boolean;
  hasNextPage: boolean;
  error: string | null;
};

type FeedAction =
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
};

const feedReducer = (state: FeedState, action: FeedAction): FeedState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isFetching: true, error: null };
    case 'FETCH_SUCCESS':
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
};

export const usePaginatedFeed = ({
  limit = 50,
  uri,
}: Omit<FeedParams, 'cursor' | 'signal'>) => {
  const [state, dispatch] = useReducer(feedReducer, initialState);
  const controllerRef = useRef<AbortController | null>(null);
  const cursorRef = useRef(state.cursor);

  useEffect(() => {
    cursorRef.current = state.cursor;
  }, [state.cursor]);

  const fetchFeedData = useCallback(
    async (refresh = false) => {
      if (refresh) dispatch({ type: 'REFRESH_FEED' });
      dispatch({ type: 'FETCH_START' });

      const response = await fetchFeed({
        limit,
        cursor: refresh ? undefined : cursorRef.current,
        uri,
      });

      if ('error' in response) {
        if (response.error !== 'signal is aborted without reason') {
          dispatch({ type: 'FETCH_ERROR', payload: response.error });
        }
      } else {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { feed: response.feed, cursor: response.cursor },
        });
      }
    },
    [limit, uri]
  );

  // Reset and fetch when uri changes
  useEffect(() => {
    dispatch({ type: 'REFRESH_FEED' });
    fetchFeedData(true);

    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [uri, fetchFeedData]); // Add uri to dependencies

  const fetchNextPage = useCallback(() => {
    if (!state.hasNextPage || state.isFetching) return;
    fetchFeedData();
  }, [fetchFeedData, state.hasNextPage, state.isFetching]);

  const refreshFeed = useCallback(() => {
    fetchFeedData(true);
  }, [fetchFeedData]);

  return { ...state, fetchNextPage, refreshFeed };
};
