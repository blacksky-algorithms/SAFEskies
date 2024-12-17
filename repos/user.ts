import supabase from '@/repos/supabase';
import { User } from '@/types/user';
import { getSessionUser } from '@/repos/iron';

export const saveUserProfile = async (userData: User): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      did: userData.did,
      handle: userData.handle,
      name: userData.name,
      avatar: userData.avatar,
      associated: userData.associated,
      labels: userData.labels,
    })
    .eq('did', userData.did); // Match existing profiles on DID

  if (error) {
    console.error('Error saving user profile:', error);
    return false; // Early return for failure
  }

  return true; // Success
};

export const getUserProfile = async () => {
  const session = await getSessionUser();

  if (!session?.user?.did) {
    // TODO: Handle
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('did', session.user.did)
    .single();

  if (error) {
    // TODO: Handle error
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data; // Success
};
