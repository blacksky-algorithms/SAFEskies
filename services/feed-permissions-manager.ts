import { SupabaseInstance } from '@/repos/supabase';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { FeedRoleInfo, UserRole } from '@/types/user';
import { ProfileManager } from '@/services/profile-manager';
import { LogsManager } from '@/services/logs-manager';
import { getActorFeeds } from '@/repos/actor';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

const DEFAULT_FEED = {
  uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
  displayName: "What's Hot",
  type: 'user' as UserRole,
};

const ROLE_PRIORITY: Record<UserRole, number> = {
  admin: 3,
  mod: 2,
  user: 1,
};

const canPerformAction = async (
  userDid: string,
  action: 'create_mod' | 'remove_mod' | 'delete_post' | 'ban_user',
  feedUri: string
): Promise<boolean> => {
  if (!userDid) return false;
  const feedRole = await getFeedRole(userDid, feedUri);

  switch (action) {
    case 'create_mod':
    case 'remove_mod':
      return feedRole === 'admin';
    case 'delete_post':
    case 'ban_user':
      return feedRole === 'mod' || feedRole === 'admin';
    default:
      return false;
  }
};

const buildFeedPermissions = (
  userDid: string,
  createdFeeds: { uri: string; displayName?: string }[],
  existingPermissions: {
    role: UserRole;
    feed_uri: string;
    feed_name: string;
  }[] = []
) => {
  const permissionsMap = new Map<
    string,
    {
      role: UserRole;
      feed_uri: string;
      feed_name: string;
      user_did: string;
      created_by?: string;
      created_at?: string;
    }
  >();

  createdFeeds.forEach((feed) => {
    if (!feed.uri) {
      throw new Error('Feed must have a valid "uri".');
    }
    permissionsMap.set(feed.uri, {
      user_did: userDid,
      feed_uri: feed.uri,
      feed_name: feed.displayName || feed.uri.split('/').pop() || '',
      role: 'admin',
      created_by: userDid,
      created_at: new Date().toISOString(),
    });
  });

  existingPermissions.forEach((perm) => {
    if (!perm.feed_uri || !perm.feed_name || !perm.role) {
      throw new Error('Invalid permission data');
    }
    const existing = permissionsMap.get(perm.feed_uri);
    if (!existing || ROLE_PRIORITY[perm.role] > ROLE_PRIORITY[existing.role]) {
      permissionsMap.set(perm.feed_uri, { ...perm, user_did: userDid });
    }
  });

  return Array.from(permissionsMap.values());
};

const determineUserRolesByFeed = (
  existingPermissions: {
    role: UserRole;
    feed_uri: string;
    feed_name: string;
  }[],
  createdFeeds: { uri: string; displayName?: string }[]
): Record<string, FeedRoleInfo> => {
  const rolesByFeed: Record<string, FeedRoleInfo> = {};

  createdFeeds.forEach((feed) => {
    rolesByFeed[feed.uri] = {
      role: 'admin',
      displayName:
        feed.displayName || feed.uri.split('/').pop() || 'Unknown Feed',
      feedUri: feed.uri,
    };
  });

  existingPermissions.forEach((permission) => {
    const currentEntry = rolesByFeed[permission.feed_uri] || {
      role: 'user',
      displayName: permission.feed_name || 'Unknown Feed',
      feedUri: permission.feed_uri,
    };

    rolesByFeed[permission.feed_uri] = {
      role:
        ROLE_PRIORITY[permission.role] > ROLE_PRIORITY[currentEntry.role]
          ? permission.role
          : currentEntry.role,
      displayName: currentEntry.displayName,
      feedUri: permission.feed_uri,
    };
  });

  return rolesByFeed;
};

const setFeedRole = async (
  targetUserDid: string,
  feedUri: string,
  role: UserRole,
  setByUserDid: string,
  feedName: string
): Promise<boolean> => {
  const canSetRole = await canPerformAction(
    setByUserDid,
    'create_mod',
    feedUri
  );

  if (!canSetRole) {
    console.error('Permission denied to set feed role:', {
      setByUserDid,
      feedUri,
    });
    return false;
  }

  try {
    const { error } = await SupabaseInstance.from('feed_permissions').upsert({
      user_did: targetUserDid,
      feed_uri: feedUri,
      feed_name: feedName,
      role: role,
      created_by: setByUserDid,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error upserting feed role:', error);
      return false;
    }

    await LogsManager.createModerationLog({
      feed_uri: feedUri,
      performed_by: setByUserDid,
      action: role === 'mod' ? 'mod_promote' : 'mod_demote',
      target_user_did: targetUserDid,
      metadata: { role, feed_name: feedName },
    });

    return true;
  } catch (error) {
    console.error('Error setting feed role:', error);
    return false;
  }
};

const getFeedRole = async (
  userDid: string,
  feedUri: string
): Promise<UserRole> => {
  const { data, error } = await SupabaseInstance.from('feed_permissions')
    .select('role')
    .eq('user_did', userDid)
    .eq('feed_uri', feedUri)
    .single();

  if (error || !data) return 'user';
  return data.role;
};

const getModeratorsByFeeds = async (feeds: Feed[]) => {
  if (!feeds.length) return [];

  try {
    const feedUris = feeds.map((feed) => feed.uri);
    const { data: permissions } = await SupabaseInstance.from(
      'feed_permissions'
    )
      .select('feed_uri, user_did, role')
      .in('feed_uri', feedUris)
      .eq('role', 'mod');

    if (!permissions) {
      return feeds.map((feed) => ({ feed, moderators: [] }));
    }

    const moderatorsByFeedUri = groupModeratorsByFeed(permissions);

    return await Promise.all(
      feeds.map(async (feed) => {
        const feedModerators = moderatorsByFeedUri[feed.uri] || [];
        const userDids = feedModerators.map(
          (mod: { user_did: string }) => mod.user_did
        );
        const profiles = await ProfileManager.getBulkProfileDetails(userDids);

        const moderators = profiles.map((profile, index) => ({
          ...profile,
          role: feedModerators[index].role,
        }));

        return { feed, moderators };
      })
    );
  } catch (error) {
    console.error('Error fetching moderators by feeds:', error);
    throw error;
  }
};

const groupModeratorsByFeed = (permissions: any[]) => {
  return permissions.reduce((acc, perm) => {
    if (!acc[perm.feed_uri]) {
      acc[perm.feed_uri] = [];
    }
    acc[perm.feed_uri].push(perm);
    return acc;
  }, {} as Record<string, any[]>);
};

const getUserAdminFeeds = async (userDid: string | undefined) => {
  if (!userDid) return [];
  try {
    const { data, error } = await SupabaseInstance.from('feed_permissions')
      .select('feed_uri, feed_name')
      .eq('user_did', userDid)
      .eq('role', 'admin');

    if (error) {
      console.error('Error fetching admin feeds:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserAdminFeeds:', error);
    return [];
  }
};

const getUserModFeeds = async (userDid: string) => {
  try {
    const { data, error } = await SupabaseInstance.from('feed_permissions')
      .select('feed_uri, feed_name')
      .eq('user_did', userDid)
      .eq('role', 'mod');

    if (error) {
      console.error('Error fetching mod feeds:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getModFeeds:', error);
    return [];
  }
};

const getUserFeeds = async (userDid?: string) => {
  if (!userDid) return { feeds: [], defaultFeed: DEFAULT_FEED };
  try {
    // 1. Get feed permissions from our database
    const [modFeeds, adminFeeds] = await Promise.all([
      getUserModFeeds(userDid),
      getUserAdminFeeds(userDid),
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
      const blueskyFeed = blueskyFeedsMap.get(feed.feed_uri);
      return {
        uri: feed.feed_uri,
        displayName: blueskyFeed?.displayName || feed.feed_name,
        description: blueskyFeed?.description,
        did: blueskyFeed?.did,
        type: 'mod' as UserRole,
      };
    });

    const adminFeedsList = adminFeeds.map((feed) => {
      const blueskyFeed = blueskyFeedsMap.get(feed.feed_uri);
      return {
        uri: feed.feed_uri,
        displayName: blueskyFeed?.displayName || feed.feed_name,
        description: blueskyFeed?.description,
        did: blueskyFeed?.did,
        type: 'admin' as UserRole,
      };
    });

    // 5. Update our database with latest feed data if needed
    await Promise.all([
      ...modFeeds.map(async (feed) => {
        const blueskyFeed = blueskyFeedsMap.get(feed.feed_uri);
        if (blueskyFeed && blueskyFeed.displayName !== feed.feed_name) {
          await SupabaseInstance.from('feed_permissions')
            .update({ feed_name: blueskyFeed.displayName })
            .eq('feed_uri', feed.feed_uri)
            .eq('user_did', userDid);
        }
      }),
      ...adminFeeds.map(async (feed) => {
        const blueskyFeed = blueskyFeedsMap.get(feed.feed_uri);
        if (blueskyFeed && blueskyFeed.displayName !== feed.feed_name) {
          await SupabaseInstance.from('feed_permissions')
            .update({ feed_name: blueskyFeed.displayName })
            .eq('feed_uri', feed.feed_uri)
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

const getHighestRoleForUser = async (
  userDid: string | undefined
): Promise<UserRole> => {
  if (!userDid) return 'user';
  const { data, error } = await SupabaseInstance.from('feed_permissions')
    .select('role')
    .eq('user_did', userDid);

  if (error || !data) return 'user';

  if (data.some((element) => element.role === 'admin')) return 'admin';
  if (data.some((element) => element.role === 'mod')) return 'mod';
  return 'user';
};

const getAllModeratorsForAdmin = async (adminDid: string) => {
  try {
    const { data: adminFeeds, error: feedsError } = await SupabaseInstance.from(
      'feed_permissions'
    )
      .select('feed_uri')
      .eq('user_did', adminDid)
      .eq('role', 'admin');

    if (feedsError) throw feedsError;

    if (!adminFeeds?.length) return [];

    const { data: moderators, error: modsError } = (await SupabaseInstance.from(
      'feed_permissions'
    )
      .select(
        `
        user_did,
        feed_uri,
        feed_name,
        role,
        profiles!feed_permissions_user_did_fkey (
          did,
          handle,
          name,
          avatar
        )
      `
      )
      .in(
        'feed_uri',
        adminFeeds.map((f) => f.feed_uri)
      )
      .in('role', ['mod', 'admin'])) as unknown as {
      data: Array<{
        user_did: string;
        feed_uri: string;
        feed_name: string;
        role: UserRole;
        profiles: ProfileViewBasic;
      }>;
      error: any;
    };

    if (modsError) throw modsError;
    if (!moderators) return [];

    return Array.from(
      new Map(
        moderators.map((mod) => [
          mod.profiles.did,
          {
            ...mod.profiles,
            role: mod.role,
          },
        ])
      ).values()
    );
  } catch (error) {
    console.error('Error fetching moderators for admin:', error);
    throw error;
  }
};

const getPostThread = async (uri: string) => {
  try {
    const response = await AtprotoAgent.app.bsky.feed.getPostThread({
      uri,
    });

    if (isThreadViewPost(response.data.thread)) {
      return response.data.thread;
    }
    return null;
  } catch (error) {
    console.error('Error fetching post thread:', error);
    return null;
  }
};

const deletePostFromFeed = async (
  userDid: string,
  postId: string
): Promise<void> => {
  // try {
  //   const endpoint = `/queue/posts/delete`;
  //   const options: RequestInit = {
  //     method: 'DELETE',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ postId }),
  //   };
  //   const response = await makeAuthenticatedRequest(userDid, endpoint, options);
  //   if (!response.ok) {
  //     throw new Error(`Failed to delete post: ${response.statusText}`);
  //   }
  //   console.log(`Post ${postId} deleted successfully.`);
  // } catch (error) {
  //   console.error('Error deleting post from feed:', error);
  // }
};
export const FeedPermissionManager = {
  canPerformAction,
  buildFeedPermissions,
  determineUserRolesByFeed,
  setFeedRole,
  getFeedRole,
  getModeratorsByFeeds,
  groupModeratorsByFeed,
  getUserAdminFeeds,
  getUserModFeeds,
  getUserFeeds,
  getHighestRoleForUser,
  getAllModeratorsForAdmin,
  getPostThread,
  deletePostFromFeed,
};
