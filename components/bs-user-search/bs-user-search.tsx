'use client';

import { useEffect, useState } from 'react';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/input';
import { LoadingSpinner } from '../loading-spinner';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export const BSUserSearch = ({
  onSelect,
}: {
  onSelect: (user: ProfileViewBasic) => void;
}) => {
  const [state, setState] = useState({
    search: '',
    results: [] as ProfileViewBasic[],
    loading: false,
  });

  const debouncedSearch = useDebounce(state.search, 300);

  const handleSelect = (user: ProfileViewBasic) => {
    setState((prevState) => ({
      ...prevState,
      search: '',
      results: [],
    }));
    onSelect(user);
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch) {
        setState((prevState) => ({
          ...prevState,
          results: [],
        }));
        return;
      }

      setState((prevState) => ({ ...prevState, loading: true }));
      try {
        const response = await AtprotoAgent.app.bsky.actor.searchActors({
          term: debouncedSearch,
          limit: 5,
        });

        if (response.success) {
          setState((prevState) => ({
            ...prevState,
            results: response.data.actors.map((actor) => ({
              ...actor,
            })),
            loading: false,
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            error: 'Something went wrong. Please try again later.',
          }));
        }
      } catch (e) {
        console.error('Error searching users:', e);
        setState((prevState) => ({
          ...prevState,
          loading: false,
          error: 'Something went wrong. Please try again later.',
        }));
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  return (
    <form className='relative w-full space-y-2' role='search'>
      <Input
        id='bs-user-search'
        type='text'
        value={state.search}
        onChange={(e) =>
          setState((prevState) => ({
            ...prevState,
            search: e.target.value,
          }))
        }
        placeholder='Type a user handle...'
        label='Search for Blue Sky Users'
        aria-autocomplete='list'
        aria-controls='bs-user-search-results'
        role='combobox'
        aria-expanded={state.results.length > 0}
      />

      {state.loading && (
        <div
          className='absolute right-4 top-2 text-sm text-app-secondary'
          aria-live='assertive'
        >
          <LoadingSpinner size='sm' />
        </div>
      )}

      {state.results.length > 0 && (
        <ul
          id='bs-user-search-results'
          role='listbox'
          aria-labelledby='bs-user-search'
          className='absolute w-full mt-2 border rounded-md shadow-lg bg-app-background border-app-border z-10'
        >
          {state.results.map((user, index) => (
            <li
              key={user.did + index}
              role='option'
              aria-selected='false'
              onClick={() => handleSelect(user)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(user);
              }}
              tabIndex={0}
              className='p-2 cursor-pointer hover:bg-app-secondary-hover focus:bg-app-secondary focus:outline-none'
            >
              <div className='font-medium text-app'>
                {user.displayName || user.handle}
              </div>
              <div className='text-sm text-app-secondary'>@{user.handle}</div>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};
