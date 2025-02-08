import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { SupabaseInstance } from '@/repos/supabase';
import { DEFAULT_FEED } from '@/lib/constants';
import { UserRole } from '@/lib/types/permission';
import { getActorFeeds } from '@/repos/actor';

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

const getFeedsByRole = async (userDid: string | undefined, role: UserRole) => {
  if (!userDid || role === 'user') return [];
  try {
    const { data, error } = await SupabaseInstance.from('feed_permissions')
      .select('uri, feed_name')
      .eq('user_did', userDid)
      .eq('role', role);

    if (error) {
      console.error('Error fetching admin feeds:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFeedsByRole:', error);
    return [];
  }
};

export const getUserFeeds = async (userDid?: string) => {
  if (!userDid) return { feeds: [], defaultFeed: DEFAULT_FEED };

  try {
    // 1. Get feed permissions from our database
    const [modFeeds, adminFeeds] = await Promise.all([
      getFeedsByRole(userDid, 'mod'),
      getFeedsByRole(userDid, 'admin'),
    ]);

    // 2. Get latest feed data from Bluesky
    const blueskyFeedsResponse = await getActorFeeds(userDid);
    const blueskyFeeds = blueskyFeedsResponse?.feeds || [];

    // 3. Create a map of feed URIs to their latest Bluesky data
    const blueskyFeedsMap = new Map(
      blueskyFeeds.map((feed) => {
        return [feed.uri, feed];
      })
    );

    // 4. Merge database permissions with latest Bluesky feed data
    const modFeedsList = modFeeds.map((feed) => {
      const blueskyFeed = blueskyFeedsMap.get(feed.uri);
      return {
        uri: feed.uri,
        displayName: blueskyFeed?.displayName || feed.feed_name,
        description: blueskyFeed?.description,
        did: blueskyFeed?.did,
        type: 'mod' as UserRole,
      };
    });

    const adminFeedsList = adminFeeds.map((feed) => {
      const blueskyFeed = blueskyFeedsMap.get(feed.uri);
      return {
        uri: feed.uri,
        displayName: blueskyFeed?.displayName || feed.feed_name,
        description: blueskyFeed?.description,
        did: blueskyFeed?.did,
        type: 'admin' as UserRole,
      };
    });

    // 5. Update our database with latest feed data if needed
    await Promise.all([
      ...modFeeds.map(async (feed) => {
        const blueskyFeed = blueskyFeedsMap.get(feed.uri);
        if (blueskyFeed && blueskyFeed.displayName !== feed.feed_name) {
          await SupabaseInstance.from('feed_permissions')
            .update({ feed_name: blueskyFeed.displayName })
            .eq('uri', feed.uri)
            .eq('user_did', userDid);
        }
      }),
      ...adminFeeds.map(async (feed) => {
        const blueskyFeed = blueskyFeedsMap.get(feed.uri);
        if (blueskyFeed && blueskyFeed.displayName !== feed.feed_name) {
          await SupabaseInstance.from('feed_permissions')
            .update({ feed_name: blueskyFeed.displayName })
            .eq('uri', feed.uri)
            .eq('user_did', userDid);
        }
      }),
    ]);

    const allFeeds = [...adminFeedsList, ...modFeedsList];
    const uniqueFeeds = Array.from(
      new Map(allFeeds.map((feed) => [feed.uri, feed])).values()
    );

    return {
      feeds: uniqueFeeds,
      defaultFeed: DEFAULT_FEED,
    };
  } catch (error) {
    console.error('Error fetching user feeds:', error);
    return {
      feeds: [],
      defaultFeed: DEFAULT_FEED,
    };
  }
};
