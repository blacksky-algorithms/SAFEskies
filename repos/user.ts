import supabase from '@/repos/supabase';
import { User } from '@/types/user';
import { getSessionUser } from '@/repos/iron';

export const saveUserProfile = async (userData: User): Promise<void> => {
  const { data, error } = await supabase
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
    throw new Error('Failed to save user profile.');
  }

  console.log('User profile saved/updated:', data);
};

export const getUserProfile = async () => {
  const session = await getSessionUser();

  if (!session?.user?.did) {
    throw new Error('No user session found. Cannot fetch profile.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('did', session.user.did)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile.');
  }

  return data;
};
