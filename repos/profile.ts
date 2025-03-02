import { SupabaseInstance } from '@/repos/supabase';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { shouldUpdateProfile } from '@/lib/utils/profile';

import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { User } from '@/lib/types/user';
import { fetchWithAuth } from '@/lib/api';

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

export const getProfile = async (): Promise<User | null> => {
  try {
    const response = await fetchWithAuth('/api/profile');
    if (!response?.ok) {
      return null;
    }
    const data = await response?.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
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

export const logIn = async (
  handle: string
): Promise<{
  status: number;
  url: string | null;
  error: string | null;
}> => {
  console.log('login -> handle', handle);
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SAFE_SKIES_API
      }/auth/signin?handle=${encodeURIComponent(handle)}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    console.log('response', response);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to sign in');
    }
    const { url } = await response.json();

    return { error: null, url, status: 200 };
  } catch (error: unknown) {
    return {
      status: 500,
      error:
        (error instanceof Error ? error.message : 'Failed to sign in') ||
        'Failed to sign in',
      url: null,
    };
  }
};
