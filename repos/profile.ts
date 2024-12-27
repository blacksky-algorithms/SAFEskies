import { SupabaseInstance } from '@/repos/supabase';
import { UserRole } from '@/types/user';
import { getSession } from '@/repos/iron';
import { getActorFeeds } from './actor';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { determineUserRolesByFeed } from '@/utils/roles';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export const saveUserProfile = async (
  blueSkyProfileData: ProfileViewBasic,
  createdFeeds: Feed[]
) => {
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

    // Validate createdFeeds structure and fallback for missing data
    const feedPermissions = createdFeeds
      .map((feed) => {
        if (!feed.uri) {
          console.warn('Invalid feed: missing URI', feed);
          return null;
        }

        return {
          user_did: blueSkyProfileData.did,
          feed_uri: feed.uri,
          feed_name:
            feed.displayName || feed.uri.split('/').pop() || 'Unnamed Feed',
          role: 'admin',
          created_at: new Date().toISOString(),
          created_by: blueSkyProfileData.did,
        };
      })
      .filter(Boolean);

    if (!feedPermissions.length) {
      console.warn('No valid feed permissions to upsert.');
      return true;
    }

    // Upsert feed permissions
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
    console.error('Error in saveUserProfile:', error);
    return false;
  }
};

// Add a function to get user's role
export const getUsersHighestRole = async (
  user_did: string
): Promise<UserRole> => {
  const { data, error } = await SupabaseInstance.from('feed_permissions')
    .select('role')
    .eq('user_did', user_did);

  if (error || !data) return 'user';
  let highestRole: UserRole = 'user';
  data.forEach((element: { role: UserRole }) => {
    if (element.role === 'admin') {
      highestRole = 'admin';
    }
    if (element.role === 'mod') {
      highestRole = 'mod';
    }
  });
  return highestRole;
};

export const getUserProfile = async () => {
  const session = await getSession();

  if (!session?.user?.did) {
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

    // Fetch user's feed-specific permissions
    const { data: permissionsData, error: permissionsError } =
      await SupabaseInstance.from('feed_permissions')
        .select('feed_uri, feed_name, role')
        .eq('user_did', userDid);

    if (permissionsError) {
      console.error('Error fetching feed permissions:', permissionsError);
      return null;
    }

    // Fetch feeds created by the user
    const actorFeedsResponse = await getActorFeeds(userDid);
    const createdFeeds: Feed[] = actorFeedsResponse?.feeds || [];

    // Determine roles for each feed
    const feedRoles = determineUserRolesByFeed(
      permissionsData || [],
      createdFeeds
    );

    // Combine profile data with feed-specific roles
    return {
      ...profileData,
      rolesByFeed: feedRoles,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};
