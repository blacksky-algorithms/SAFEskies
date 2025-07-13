'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input, RadioGroup } from '@/components/input';
import { LoadingSpinner } from '@/components/loading-spinner';
import { OptimizedImage } from '@/components/optimized-image';
import { Icon } from '@/components/icon';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import cc from 'classcat';
import { useRouter } from 'next/navigation';
import { DEFAULT_FEED } from '@/lib/constants';

type SearchType = 'users' | 'posts';

interface SearchResult {
  users: ProfileViewBasic[];
  posts: PostView[];
}

interface SearchPanelProps {
  className?: string;
}

export const SearchPanel = ({ className = '' }: SearchPanelProps) => {
  const router = useRouter();
  const [state, setState] = useState({
    searchType: 'posts' as SearchType,
    search: '',
    results: { users: [], posts: [] } as SearchResult,
    loading: false,
    error: null as string | null,
  });

  const debouncedSearch = useDebounce(state.search, 300);

  const fetchUsers = useCallback(async (query: string) => {
    try {
      const params = new URLSearchParams({ q: query, limit: '10' });
      const response = await fetch(`/api/atproto/search/users?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search users');
      }

      const data = await response.json();
      return data.actors || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }, []);

  const fetchPosts = useCallback(async (query: string) => {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10',
      });
      const response = await fetch(`/api/atproto/search/posts?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search posts');
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }, []);

  const performSearch = useCallback(async () => {
    if (!debouncedSearch.trim()) {
      setState((prev) => ({
        ...prev,
        results: { users: [], posts: [] },
        error: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (state.searchType === 'users') {
        const users = await fetchUsers(debouncedSearch);
        setState((prev) => ({
          ...prev,
          results: { ...prev.results, users },
          loading: false,
        }));
      } else {
        const posts = await fetchPosts(debouncedSearch);
        setState((prev) => ({
          ...prev,
          results: { ...prev.results, posts },
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, [debouncedSearch, state.searchType, fetchUsers, fetchPosts]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleUserClick = (user: ProfileViewBasic) => {
    // Navigate to user profile or handle user selection
    window.open(`https://bsky.app/profile/${user.handle}`, '_blank');
  };

  const handlePostClick = (post: PostView) => {
    // Navigate to view post page with Blacksky as the feed context
    // Blacksky API is forgiving and handles posts that don't exist in its feed gracefully
    router.push(
      `/post/${encodeURIComponent(post.uri)}?feed=${encodeURIComponent(
        DEFAULT_FEED.displayName
      )}&uri=${encodeURIComponent(DEFAULT_FEED.uri)}`
    );
  };

  const currentResults =
    state.searchType === 'users' ? state.results.users : state.results.posts;

  return (
    <div
      className={cc([
        'bg-app-background border-l border-app-border p-4 h-full overflow-y-auto',
        className,
      ])}
    >
      <div className='space-y-4 h-full'>
        <div className='flex items-center gap-2'>
          <Icon
            icon='MagnifyingGlassIcon'
            className='h-5 w-5 text-app-secondary'
          />
          <h2 className='text-lg font-semibold text-app'>Search</h2>
        </div>

        <div className='space-y-3'>
          <RadioGroup
            name='search-type'
            label='Search Type'
            value={state.searchType}
            onChange={(value: string) =>
              setState((prev) => ({
                ...prev,
                searchType: value as SearchType,
                results: { users: [], posts: [] },
              }))
            }
            options={[
              { value: 'posts', label: 'Posts' },
              { value: 'users', label: 'Users' },
            ]}
            orientation='horizontal'
          />

          <div className='relative'>
            <Input
              id='search-input'
              type='text'
              value={state.search}
              onChange={(e) =>
                setState((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder={`Search for ${state.searchType}...`}
              label={`Search ${state.searchType}`}
            />

            {state.loading && (
              <div className='absolute right-3 top-9'>
                <LoadingSpinner size='sm' />
              </div>
            )}
          </div>
        </div>

        {state.error && (
          <div className='p-3 rounded-md bg-red-50 border border-red-200'>
            <p className='text-sm text-red-600'>{state.error}</p>
          </div>
        )}

        {currentResults.length > 0 && (
          <div className='space-y-2 '>
            <h3 className='text-sm font-medium text-app-secondary'>
              {state.searchType === 'users' ? 'Users' : 'Posts'}
            </h3>

            <div className='space-y-1 overflow-y-auto'>
              {state.searchType === 'users'
                ? (state.results.users as ProfileViewBasic[]).map(
                    (user, index) => (
                      <div
                        key={user.did + index}
                        onClick={() => handleUserClick(user)}
                        className='p-3 rounded-md border border-app-border hover:bg-app-secondary-hover cursor-pointer transition-colors'
                      >
                        <div className='flex items-start gap-3'>
                          {user.avatar && (
                            <OptimizedImage
                              src={user.avatar}
                              alt={`${user.displayName || user.handle} avatar`}
                              className='w-8 h-8 rounded-full flex-shrink-0'
                            />
                          )}
                          <div className='min-w-0 flex-1'>
                            <div className='font-medium text-app truncate'>
                              {user.displayName || user.handle}
                            </div>
                            <div className='text-sm text-app-secondary truncate'>
                              @{user.handle}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                : (state.results.posts as PostView[]).map((post, index) => (
                    <div
                      key={post.cid + index}
                      onClick={() => handlePostClick(post)}
                      className='p-3 rounded-md border border-app-border hover:bg-app-secondary-hover cursor-pointer transition-colors'
                    >
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          {post.author.avatar && (
                            <OptimizedImage
                              src={post.author.avatar}
                              alt={`${
                                post.author.displayName || post.author.handle
                              } avatar`}
                              className='w-6 h-6 rounded-full flex-shrink-0'
                            />
                          )}
                          <div className='font-medium text-sm text-app truncate'>
                            {post.author.displayName || post.author.handle}
                          </div>
                          <div className='text-xs text-app-secondary'>
                            @{post.author.handle}
                          </div>
                        </div>

                        {post.record &&
                          typeof post.record === 'object' &&
                          'text' in post.record && (
                            <div className='text-sm text-app line-clamp-3'>
                              {post.record.text as string}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {debouncedSearch &&
          !state.loading &&
          currentResults.length === 0 &&
          !state.error && (
            <div className='text-center py-8 text-app-secondary'>
              <Icon
                icon='MagnifyingGlassIcon'
                className='h-12 w-12 mx-auto mb-3 opacity-50'
              />
              <p>
                No {state.searchType} found for &ldquo;{debouncedSearch}&rdquo;
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
