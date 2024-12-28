import { SupabaseInstance } from '../repos/supabase';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { UserRole } from '@/types/user';
import { ProfileManager } from './profile-manager';

export class FeedManager {
  static async canPerformAction(
    userDid: string,
    action: 'create_mod' | 'remove_mod' | 'delete_post' | 'ban_user',
    feedUri: string
  ): Promise<boolean> {
    const feedRole = await this.getFeedRole(userDid, feedUri);

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
  }

  static async setFeedRole(
    targetUserDid: string,
    feedUri: string,
    role: UserRole,
    setByUserDid: string,
    feedName: string
  ): Promise<boolean> {
    const canSetRole = await this.canPerformAction(
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

      return true;
    } catch (error) {
      console.error('Error setting feed role:', error);
      return false;
    }
  }

  static async getFeedRole(
    userDid: string,
    feedUri: string
  ): Promise<UserRole> {
    const { data, error } = await SupabaseInstance.from('feed_permissions')
      .select('role')
      .eq('user_did', userDid)
      .eq('feed_uri', feedUri)
      .single();

    if (error || !data) return 'user';
    return data.role;
  }

  static async getModeratorsByFeeds(feeds: Feed[]) {
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

      const moderatorsByFeedUri = this.groupModeratorsByFeed(permissions);

      return await Promise.all(
        feeds.map(async (feed) => {
          const feedModerators = moderatorsByFeedUri[feed.uri] || [];
          const userDids = feedModerators.map(
            (mod: { user_did: string }) => mod.user_did
          );
          const profiles = await ProfileManager.getBulkProfileDetails(userDids);

          const moderators = profiles.map((profile, index) => {
            return {
              ...profile,
              role: feedModerators[index].role,
            };
          });

          return { feed, moderators };
        })
      );
    } catch (error) {
      console.error('Error fetching moderators by feeds:', error);
      throw error;
    }
  }

  private static groupModeratorsByFeed(permissions: any[]) {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.feed_uri]) {
        acc[perm.feed_uri] = [];
      }
      acc[perm.feed_uri].push(perm);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private static readonly DEFAULT_FEED = {
    uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
    displayName: "What's Hot",
    type: 'user' as UserRole,
  };

  static async getUserAdminFeeds(userDid: string) {
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
  }

  static async getUserModFeeds(userDid: string) {
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
  }

  static async getUserFeeds(userDid: string) {
    try {
      // Get feeds user moderates
      const modFeeds = await this.getUserModFeeds(userDid);
      const modFeedsList = modFeeds.map((feed) => ({
        uri: feed.feed_uri,
        displayName: feed.feed_name,
        type: 'mod' as UserRole,
      }));

      // Get feeds user admins
      const adminFeeds = await this.getUserAdminFeeds(userDid);
      const adminFeedsList = adminFeeds.map((feed) => ({
        uri: feed.feed_uri,
        displayName: feed.feed_name,
        type: 'admin' as UserRole,
      }));

      // Combine all feeds, removing duplicates based on URI
      // If a feed appears in multiple categories, prioritize the highest permission
      const allFeeds = [...adminFeedsList, ...modFeedsList];
      const uniqueFeeds = Array.from(
        new Map(allFeeds.map((feed) => [feed.uri, feed])).values()
      );

      return {
        feeds: uniqueFeeds,
        defaultFeed: this.DEFAULT_FEED,
      };
    } catch (error) {
      console.error('Error fetching user feeds:', error);
      return {
        feeds: [],
        defaultFeed: this.DEFAULT_FEED,
      };
    }
  }

  static async getFeedsByRole(userDid: string, role: UserRole) {
    try {
      const { data, error } = await SupabaseInstance.from('feed_permissions')
        .select('feed_uri, feed_name')
        .eq('user_did', userDid)
        .eq('role', role);

      if (error) {
        console.error(`Error fetching ${role} feeds:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Error in getFeedsByRole for ${role}:`, error);
      return [];
    }
  }
}
