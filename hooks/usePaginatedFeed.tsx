import { useReducer, useEffect, useRef, startTransition } from 'react';
import { FeedParams, fetchFeed } from '@/repos/feed-repo';
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
  did,
  feedName,
  limit = 50,
}: Omit<FeedParams, 'cursor' | 'signal'>) => {
  const [state, dispatch] = useReducer(feedReducer, initialState);
  const controllerRef = useRef<AbortController | null>(null);

  const initializeController = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
  };

  const fetchFeedData = async (refresh = false) => {
    initializeController();
    if (refresh) dispatch({ type: 'REFRESH_FEED' });
    dispatch({ type: 'FETCH_START' });

    const response = await fetchFeed({
      did,
      feedName,
      limit,
      cursor: refresh ? undefined : state.cursor,
      signal: controllerRef.current?.signal,
    });

    if ('error' in response) {
      if (response.error !== 'AbortError') {
        dispatch({ type: 'FETCH_ERROR', payload: response.error });
      }
    } else {
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { feed: response.feed, cursor: response.cursor },
      });
    }
  };

  const fetchNextPage = () => {
    if (!state.hasNextPage || state.isFetching) return;
    startTransition(() => fetchFeedData());
  };

  const refreshFeed = () => fetchFeedData(true);

  useEffect(() => {
    fetchFeedData();

    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [did, feedName, limit]);

  return { ...state, fetchNextPage, refreshFeed };
};
