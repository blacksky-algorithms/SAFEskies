import { SupabaseInstance } from '@/repos/supabase';
import { User, UserRole } from '@/types/user';
import { getSessionUser } from '@/repos/iron';
import { getActorFeeds } from './actor';

export const saveUserProfile = async (userData: User): Promise<boolean> => {
  try {
    // First, save the basic profile information
    const { error: profileError } = await SupabaseInstance.from('profiles')
      .upsert({
        did: userData.did,
        handle: userData.handle,
        name: userData.name,
        avatar: userData.avatar,
        associated: userData.associated,
        labels: userData.labels,
      })
      .eq('did', userData.did);

    if (profileError) {
      console.error('Error saving user profile:', profileError);
      return false;
    }

    // Check if a role already exists for this user
    const { data: existingRole } = await SupabaseInstance.from('user_roles')
      .select('role')
      .eq('user_did', userData.did)
      .single();

    if (existingRole) {
      // If the role should be updated (e.g., user became an admin), update it
      if (existingRole.role !== userData.role) {
        const { error: updateError } = await SupabaseInstance.from('user_roles')
          .update({
            role: userData.role,
            updated_at: new Date().toISOString(),
          })
          .eq('user_did', userData.did);

        if (updateError) {
          console.error('Error updating user role:', updateError);
          return false;
        }
      }
    } else {
      // If no role exists, insert a new one
      const { error: insertError } = await SupabaseInstance.from(
        'user_roles'
      ).insert({
        user_did: userData.did,
        role: userData.role || 'user',
        created_at: new Date().toISOString(),
        created_by: userData.did,
      });

      if (insertError) {
        console.error('Error inserting user role:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in saveUserProfile:', error);
    return false;
  }
};

// Add a function to get user's role
export const getUserRole = async (did: string): Promise<UserRole> => {
  try {
    // First check if they have any feeds (which would make them an admin)
    const feedsResponse = await getActorFeeds(did);
    if (feedsResponse?.feeds && feedsResponse.feeds.length > 0) {
      return 'admin';
    }

    // If no feeds, check their assigned role
    const { data: roleData } = await SupabaseInstance.from('user_roles')
      .select('role')
      .eq('user_did', did)
      .single();

    return roleData?.role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

export const getUserProfile = async () => {
  const session = await getSessionUser();

  if (!session?.user?.did) {
    return null;
  }

  try {
    // Get basic profile data
    const { data: profileData, error: profileError } =
      await SupabaseInstance.from('profiles')
        .select('*')
        .eq('did', session.user.did)
        .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    // Get role data
    const role = await getUserRole(session.user.did);

    // Combine profile and role data
    return {
      ...profileData,
      role,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};
