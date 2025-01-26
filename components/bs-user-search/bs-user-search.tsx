'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/input';
import { LoadingSpinner } from '../loading-spinner';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export const BSUserSearch = ({
  onSelect,
  id = 'bs-user-search',
  label = 'Search for Blue Sky Users',
  placeholder = 'Type a user handle or name...',
}: {
  onSelect: (user: ProfileViewBasic) => void;
  id?: string;
  label?: string;
  placeholder?: string;
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

  const fetchBlueskyUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        searchQuery: debouncedSearch,
      });

      const response = await fetch(`/api/moderators/search?${params}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch users');
      }

      const data = await response.json();

      return { data: data.results.data.actors, success: true };
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [debouncedSearch]);

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
        const response = await fetchBlueskyUsers();

        if (response && 'success' in response) {
          setState((prevState) => ({
            ...prevState,
            results: response.data,
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
  }, [debouncedSearch, fetchBlueskyUsers]);

  return (
    <form className={'relative w-full space-y-2'} role='search'>
      <Input
        id={id}
        type='text'
        value={state.search}
        onChange={(e) =>
          setState((prevState) => ({
            ...prevState,
            search: e.target.value,
          }))
        }
        placeholder={placeholder}
        label={label}
        aria-autocomplete='list'
        aria-controls={`${id}-results`}
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
          id={`${id}-results`}
          role='listbox'
          aria-labelledby={id}
          className='absolute w-full mt-2 border rounded-md shadow-lg bg-app-background border-app-border z-10 '
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
