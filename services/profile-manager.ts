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
        name: blueSkyProfileData.displayName,
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

const getProfileDetails = async (
  userDid: string
): Promise<ProfileViewBasic> => {
  let typedCachedProfile: ProfileViewBasic | null = null;

  try {
    // 1. First check our database
    const { data: cachedProfile, error: dbError } = await SupabaseInstance.from(
      'profiles'
    )
      .select('*')
      .eq('did', userDid)
      .single();

    if (dbError) {
      console.error('Error fetching cached profile:', dbError);
    }

    typedCachedProfile = cachedProfile as ProfileViewBasic | null;

    // 2. Get fresh data from Bluesky
    const response = await AtprotoAgent.app.bsky.actor.getProfile({
      actor: userDid,
    });

    if (!response.success) {
      return typedCachedProfile || { did: userDid, handle: userDid };
    }

    // 3. Compare and update if needed
    if (shouldUpdateProfile(typedCachedProfile, response.data)) {
      const { error: upsertError } = await SupabaseInstance.from('profiles')
        .upsert({
          did: response.data.did,
          handle: response.data.handle,
          name: response.data.displayName,
          avatar: response.data.avatar,
          associated: response.data.associated,
          labels: response.data.labels,
        })
        .eq('did', userDid);

      if (upsertError) {
        console.error('Error updating profile:', upsertError);
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching profile details:', error);
    return typedCachedProfile || { did: userDid, handle: userDid };
  }
};

const getProfile = async () => {
  const session = await getSession();
  if (!session.user) {
    return null;
  }

  try {
    const userDid = session.user.did;

    // Get profile with potential updates
    const profileData = await getProfileDetails(userDid);
    if (!profileData) return null;

    // Fetch and sync feed data
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

    // Update feed permissions if needed
    if (createdFeeds.length > 0) {
      const feedPermissions = FeedPermissionManager.buildFeedPermissions(
        userDid,
        createdFeeds,
        permissionsResponse.data || []
      );

      await SupabaseInstance.from('feed_permissions').upsert(feedPermissions, {
        onConflict: 'user_did,feed_uri',
      });
    }

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

const getBulkProfileDetails = async (
  userDids: string[]
): Promise<ProfileViewBasic[]> => {
  // Deduplicate DIDs
  const uniqueDids = [...new Set(userDids)];

  // Get all profiles in parallel
  const profiles = await Promise.all(
    uniqueDids.map((did) => getProfileDetails(did))
  );

  // Map back to original order
  return userDids.map(
    (did) =>
      profiles.find((profile) => profile.did === did) || { did, handle: did }
  );
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

const shouldUpdateProfile = (
  cached: ProfileViewBasic | null,
  fresh: ProfileViewBasic
): boolean => {
  if (!cached) return true;

  return (
    cached.handle !== fresh.handle ||
    cached.displayName !== fresh.displayName ||
    cached.avatar !== fresh.avatar ||
    cached.banner !== fresh.banner ||
    cached.description !== fresh.description ||
    JSON.stringify(cached.associated) !== JSON.stringify(fresh.associated) ||
    JSON.stringify(cached.labels) !== JSON.stringify(fresh.labels)
  );
};

export const ProfileManager = {
  saveProfile,
  getProfile,
  getProfileDetails,
  getDisplayNameByDID,
  getBulkProfileDetails,
};
