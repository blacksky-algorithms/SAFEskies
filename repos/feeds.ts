import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { DEFAULT_FEED } from '@/lib/constants';
import { fetchWithAuth } from '@/lib/api';

export interface FeedParams {
  limit?: number;
  cursor?: string;
  uri: string;
}

export interface FeedResponse {
  feed: FeedViewPost[];
  cursor?: string;
}

export const fetchFeed = async ({
  limit = 50,
  cursor,
  uri,
}: FeedParams): Promise<FeedResponse | { error: Error['message'] }> => {
  try {
    const { data } = await AtprotoAgent.app.bsky.feed.getFeed({
      feed: uri,
      limit,
      cursor,
    });

    return { feed: data.feed, cursor: data.cursor };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: 'Unknown error' };
    }
  }
};

export const getUserFeeds = async (userDid?: string) => {
  if (!userDid) {
    return {
      feeds: [],
      defaultFeed: DEFAULT_FEED,
    };
  }
  try {
    const response = await fetchWithAuth(
      `/api/feeds/user-feeds?userDid=${userDid}`
    );

    const data = await response?.json();
    return data;
  } catch (error: unknown) {
    return {
      feeds: [],
      defaultFeed: DEFAULT_FEED,
      error:
        error instanceof Error ? error.message : 'Error fetching user feeds',
    };
  }
};
