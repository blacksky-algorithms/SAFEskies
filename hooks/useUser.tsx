import { useEffect, useState } from 'react';
import { getSessionUser } from '@/repos/iron';
import { User } from '@/types/user';

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

  useEffect(() => {
    const getUserData = async () => {
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
    };

    getUserData();
  }, []);

  return state;
};
