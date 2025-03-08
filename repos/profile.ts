import { User } from '@/lib/types/user';
import { fetchWithAuth } from '@/lib/api';

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
