// repos/profile-manager.ts
import { SupabaseInstance } from '@/repos/supabase';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { UserRole } from '@/types/user';
import { getActorFeeds } from '../repos/actor';
import { determineUserRolesByFeed } from '@/utils/roles';
import { getSession } from '../repos/iron';

export class ProfileManager {
  static async saveProfile(
    blueSkyProfileData: ProfileViewBasic,
    createdFeeds: Feed[]
  ): Promise<boolean> {
    try {
      // Ensure the profile exists before handling feed permissions
      const { error: profileError } = await SupabaseInstance.from('profiles')
        .upsert({
          did: blueSkyProfileData.did,
          handle: blueSkyProfileData.handle,
          name: blueSkyProfileData.name,
          avatar: blueSkyProfileData.avatar,
          associated: blueSkyProfileData.associated,
          labels: blueSkyProfileData.labels,
        })
        .eq('did', blueSkyProfileData.did);

      if (profileError) {
        console.error('Error saving user profile:', profileError);
        return false;
      }

      const feedPermissions = this.buildFeedPermissions(
        blueSkyProfileData.did,
        createdFeeds
      );

      if (!feedPermissions.length) {
        console.warn('No valid feed permissions to upsert.');
        return true;
      }

      const { error: permissionError } = await SupabaseInstance.from(
        'feed_permissions'
      ).upsert(feedPermissions, {
        onConflict: 'user_did,feed_uri',
      });

      if (permissionError) {
        console.error('Error saving feed permissions:', permissionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveProfile:', error);
      return false;
    }
  }

  private static buildFeedPermissions(userDid: string, createdFeeds: Feed[]) {
    return createdFeeds
      .map((feed) => {
        if (!feed.uri) {
          console.warn('Invalid feed: missing URI', feed);
          return null;
        }

        return {
          user_did: userDid,
          feed_uri: feed.uri,
          feed_name:
            feed.displayName || feed.uri.split('/').pop() || 'Unnamed Feed',
          role: 'admin',
          created_at: new Date().toISOString(),
          created_by: userDid,
        };
      })
      .filter(Boolean);
  }

  static async getHighestRole(userDid: string): Promise<UserRole> {
    const { data, error } = await SupabaseInstance.from('feed_permissions')
      .select('role')
      .eq('user_did', userDid);

    if (error || !data) return 'user';

    if (data.some((element) => element.role === 'admin')) return 'admin';
    if (data.some((element) => element.role === 'mod')) return 'mod';
    return 'user';
  }

  static async getProfile() {
    const session = await getSession();
    if (!session.user) {
      return null;
    }
    const userDid = session.user.did;
    try {
      // Fetch basic profile data
      const { data: profileData, error: profileError } =
        await SupabaseInstance.from('profiles')
          .select('*')
          .eq('did', userDid)
          .single();

      if (profileError || !profileData) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Fetch user's feed-specific permissions
      const { data: permissionsData, error: permissionsError } =
        await SupabaseInstance.from('feed_permissions')
          .select('feed_uri, feed_name, role')
          .eq('user_did', userDid);

      if (permissionsError) {
        console.error('Error fetching feed permissions:', permissionsError);
        return null;
      }

      const actorFeedsResponse = await getActorFeeds(userDid);
      const createdFeeds: Feed[] = actorFeedsResponse?.feeds || [];

      const feedRoles = determineUserRolesByFeed(
        permissionsData || [],
        createdFeeds
      );

      return {
        ...profileData,
        rolesByFeed: feedRoles,
      };
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  static async getProfileDetails(userDid: string) {
    try {
      const { data: profileData } = await SupabaseInstance.from('profiles')
        .select('*')
        .eq('did', userDid)
        .single();

      if (profileData) {
        return profileData;
      }

      const response = await AtprotoAgent.app.bsky.actor.getProfile({
        actor: userDid,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching profile details:', error);
      return { did: userDid, handle: userDid };
    }
  }

  static async getDisplayNameByDID(did: string): Promise<string> {
    try {
      const response = await AtprotoAgent.app.bsky.actor.getProfile({
        actor: did,
      });

      if (response.success) {
        return response.data.displayName || response.data.handle;
      }

      // If all else fails, return the DID
      return did;
    } catch (error) {
      console.error('Error fetching display name:', error);
      return did; // Fallback to DID if everything fails
    }
  }

  static async getBulkProfileDetails(userDids: string[]) {
    return await Promise.all(
      userDids.map((did) => this.getProfileDetails(did))
    );
  }
}
