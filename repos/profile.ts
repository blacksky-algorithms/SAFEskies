import {
  buildFeedPermissions,
  determineUserRolesByFeed,
} from '@/lib/utils/permission';
import { SupabaseInstance } from '@/repos/supabase';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { shouldUpdateProfile } from '@/lib/utils/profile';
import { getActorFeeds } from '@/repos/actor';
import { getSession } from '@/repos/iron';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';

export const saveProfile = async (
  blueSkyProfileData: ProfileViewBasic,
  createdFeeds: Feed[]
): Promise<boolean> => {
  try {
    // Save basic profile data
    const { error: profileError } = await SupabaseInstance.from('profiles')
      .upsert({
        did: blueSkyProfileData.did,
        handle: blueSkyProfileData.handle,
        displayName: blueSkyProfileData.displayName,
        avatar: blueSkyProfileData.avatar,
        associated: blueSkyProfileData.associated,
        labels: blueSkyProfileData.labels,
      })
      .eq('did', blueSkyProfileData.did);

    if (profileError) {
      console.error('Error saving user profile:', profileError);
      return false;
    }

    const feedPermissions = buildFeedPermissions(
      blueSkyProfileData.did,
      createdFeeds
    );

    if (feedPermissions.length > 0) {
      const { error: permissionError } = await SupabaseInstance.from(
        'feed_permissions'
      ).upsert(feedPermissions, {
        onConflict: 'user_did,uri',
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

export const getProfileDetails = async (
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
          avatar: response.data.avatar,
          associated: response.data.associated,
          labels: response.data.labels,
          displayName: response.data.displayName,
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

export const getProfile = async () => {
  const session = await getSession();
  if (!session.user) {
    return null;
  }

  try {
    const userDid = session.user.did;

    // Fetch the user's latest profile from Supabase and actor feeds in parallel
    const [profileData, permissionsResponse, actorFeedsResponse] =
      await Promise.all([
        getProfileDetails(userDid),
        SupabaseInstance.from('feed_permissions')
          .select('uri, feed_name, role')
          .eq('user_did', userDid),
        getActorFeeds(userDid),
      ]);

    if (!profileData || permissionsResponse.error) {
      console.error(
        'Error fetching profile or feed permissions:',
        permissionsResponse.error
      );
      return null;
    }

    const createdFeeds = actorFeedsResponse?.feeds || [];

    // Build and update feed permissions if necessary
    if (createdFeeds.length > 0) {
      const feedPermissions = buildFeedPermissions(
        userDid,
        createdFeeds,
        permissionsResponse.data || []
      );
      await SupabaseInstance.from('feed_permissions').upsert(feedPermissions, {
        onConflict: 'user_did,uri',
      });
    }

    // Determine and return roles by feed
    const feedRoles = determineUserRolesByFeed(
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

export const getBulkProfileDetails = async (
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

export const getDisplayNameByDID = async (did: string): Promise<string> => {
  try {
    const profile = await getProfileDetails(did);
    return profile.displayName || profile.handle || did;
  } catch (error) {
    console.error('Error fetching display name:', error);
    return did;
  }
};
