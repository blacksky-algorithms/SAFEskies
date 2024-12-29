import { SupabaseInstance } from '@/repos/supabase';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { getSession } from '@/repos/iron';
import { FeedPermissionManager } from './feed-permissions-manager';
import { getActorFeeds } from '@/repos/actor';

const saveProfile = async (
  blueSkyProfileData: ProfileViewBasic,
  createdFeeds: Feed[]
): Promise<boolean> => {
  try {
    // Save basic profile data
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

    // Let FeedPermissionManager handle feed permissions
    const feedPermissions = FeedPermissionManager.buildFeedPermissions(
      blueSkyProfileData.did,
      createdFeeds
    );

    if (feedPermissions.length > 0) {
      const { error: permissionError } = await SupabaseInstance.from(
        'feed_permissions'
      ).upsert(feedPermissions, {
        onConflict: 'user_did,feed_uri',
      });

      if (permissionError) {
        console.error('Error saving feed permissions:', permissionError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in saveProfile:', error);
    return false;
  }
};

const getProfile = async () => {
  const session = await getSession();
  if (!session.user) {
    return null;
  }

  try {
    const userDid = session.user.did;

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

    // Fetch user's feed-specific permissions and created feeds
    const [permissionsResponse, actorFeedsResponse] = await Promise.all([
      SupabaseInstance.from('feed_permissions')
        .select('feed_uri, feed_name, role')
        .eq('user_did', userDid),
      getActorFeeds(userDid),
    ]);

    if (permissionsResponse.error) {
      console.error(
        'Error fetching feed permissions:',
        permissionsResponse.error
      );
      return null;
    }

    const createdFeeds = actorFeedsResponse?.feeds || [];
    const feedRoles = FeedPermissionManager.determineUserRolesByFeed(
      permissionsResponse.data || [],
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
};

const getProfileDetails = async (userDid: string) => {
  try {
    const response = await AtprotoAgent.app.bsky.actor.getProfile({
      actor: userDid,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching profile details:', error);
    return { did: userDid, handle: userDid };
  }
};

const getDisplayNameByDID = async (did: string): Promise<string> => {
  try {
    const profile = await getProfileDetails(did);
    return profile.displayName || profile.handle || did;
  } catch (error) {
    console.error('Error fetching display name:', error);
    return did;
  }
};

const getBulkProfileDetails = async (userDids: string[]) => {
  return await Promise.all(userDids.map((did) => getProfileDetails(did)));
};

export const ProfileManager = {
  saveProfile,
  getProfile,
  getProfileDetails,
  getDisplayNameByDID,
  getBulkProfileDetails,
};
