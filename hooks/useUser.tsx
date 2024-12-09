import { useState, useEffect, useCallback } from 'react';
import { getSessionUser } from '@/repos/iron'; // Assuming this is the function to get user data
import { signOut as signOutAction } from '@/repos/actions'; // Import the signOut action
import { User } from '@/types/user'; // Assuming this is the User type

export const useUser = () => {
  const [state, setState] = useState<{
    user: User | null;
    loading: boolean;
    error: string | null;
  }>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));
    try {
      const { user } = await getSessionUser();
      setState({ user, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching session data:', error);
      setState({
        user: null,
        loading: false,
        error: 'Failed to fetch session data',
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutAction();
    setState({ user: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { ...state, fetchUser, signOut };
};
