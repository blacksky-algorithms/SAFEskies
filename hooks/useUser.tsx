import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user';
import { getSessionUser } from '@/repos/iron';
import { signOutOfBlueSky } from '@/repos/actions';

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

  // Fetch user from Supabase session
  const fetchUser = useCallback(async () => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    try {
      const { user } = await getSessionUser();
      setState({ user, loading: false, error: null });
    } catch (error) {
      // TODO: Handle error
      setState({
        user: null,
        loading: false,
        error: 'Failed to fetch user data',
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutOfBlueSky();
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        error: 'Failed to sign out',
      }));
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { ...state, fetchUser, signOut };
};
