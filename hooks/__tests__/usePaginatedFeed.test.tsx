// hooks/__tests__/usePaginatedFeed.test.tsx

import React from 'react';
import { renderHook, act, waitFor, createQueryClient } from '@/test/setupTests';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { usePaginatedFeed, useHasNewPosts } from '@/hooks/usePaginatedFeed';
import { fetchFeed } from '@/repos/feeds';
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

import { MOCKED_POSTS } from '@/test/mocks/mocked-posts';

// Mock fetchFeed so we can control API responses.
jest.mock('@/repos/feeds', () => ({
  fetchFeed: jest.fn(),
}));

// Sample pages
const mockedPage1 = {
  feed: [MOCKED_POSTS[0], MOCKED_POSTS[1]],
  cursor: 'cursor1',
};

const mockedPage2 = {
  feed: [MOCKED_POSTS[1], MOCKED_POSTS[2]],
  cursor: null,
};

describe('usePaginatedFeed', () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    queryClient = createQueryClient();
    (fetchFeed as jest.Mock).mockReset();
  });

  // Wrapper to provide the QueryClient to our hooks.
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('initial state returns an empty feed and then resolves to page data', async () => {
    (fetchFeed as jest.Mock).mockResolvedValueOnce(mockedPage1);
    const { result } = renderHook(
      () => usePaginatedFeed({ uri: 'test-uri', limit: 2 }),
      { wrapper }
    );

    // Initially, feed should be empty.
    expect(result.current.feed).toEqual([]);

    // Wait until the hook updates.
    await waitFor(() => {
      expect(result.current.feed).toEqual(mockedPage1.feed);
    });
  });

  it('deduplicates posts across multiple pages', async () => {
    (fetchFeed as jest.Mock)
      .mockResolvedValueOnce(mockedPage1)
      .mockResolvedValueOnce(mockedPage2);

    const { result } = renderHook(
      () => usePaginatedFeed({ uri: 'test-uri', limit: 2 }),
      { wrapper }
    );

    // Wait for the first page to load.
    await waitFor(() => {
      expect(result.current.feed).toEqual(mockedPage1.feed);
    });

    act(() => {
      result.current.fetchNextPage();
    });

    // Expect deduplication: posts with uris uri1, uri2, and uri3.
    await waitFor(() => {
      expect(result.current.feed).toEqual([
        MOCKED_POSTS[0],
        MOCKED_POSTS[1],
        MOCKED_POSTS[2],
      ]);
    });
  });

  it('refreshFeed triggers a refresh', async () => {
    (fetchFeed as jest.Mock).mockResolvedValueOnce(mockedPage1);
    const { result } = renderHook(
      () => usePaginatedFeed({ uri: 'test-uri', limit: 2 }),
      { wrapper }
    );
    await waitFor(() => {
      expect(result.current.feed).toEqual(mockedPage1.feed);
    });

    // Prepare a new response for refresh.
    (fetchFeed as jest.Mock).mockResolvedValueOnce({
      feed: [
        { ...MOCKED_POSTS[2], post: { ...MOCKED_POSTS[2].post, uri: 'uri4' } },
        { ...MOCKED_POSTS[2], post: { ...MOCKED_POSTS[2].post, uri: 'uri5' } },
      ],
      cursor: null,
    });

    act(() => {
      result.current.refreshFeed();
    });

    await waitFor(() => {
      expect(result.current.feed).toEqual([
        { ...MOCKED_POSTS[2], post: { ...MOCKED_POSTS[2].post, uri: 'uri4' } },
        { ...MOCKED_POSTS[2], post: { ...MOCKED_POSTS[2].post, uri: 'uri5' } },
      ]);
    });
  });
});

describe('useHasNewPosts', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('returns false when no new posts are detected', async () => {
    const currentFeed: FeedViewPost[] = [MOCKED_POSTS[0], MOCKED_POSTS[1]];
    (fetchFeed as jest.Mock).mockResolvedValueOnce({
      feed: [MOCKED_POSTS[0], MOCKED_POSTS[1]],
      cursor: 'cursor1',
    });

    const { result } = renderHook(
      () =>
        useHasNewPosts({
          uri: 'test-uri',
          limit: 2,
          pollingInterval: 1000,
          currentFeed,
          isFetching: false,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('returns true when new posts are detected', async () => {
    const currentFeed: FeedViewPost[] = [MOCKED_POSTS[0], MOCKED_POSTS[1]];
    (fetchFeed as jest.Mock).mockResolvedValueOnce({
      feed: [MOCKED_POSTS[0], MOCKED_POSTS[1], MOCKED_POSTS[2]],
      cursor: 'cursor1',
    });

    const { result } = renderHook(
      () =>
        useHasNewPosts({
          uri: 'test-uri',
          limit: 2,
          pollingInterval: 1000,
          currentFeed,
          isFetching: false,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('polling is disabled when isFetching is true', async () => {
    const currentFeed: FeedViewPost[] = [MOCKED_POSTS[0], MOCKED_POSTS[1]];
    (fetchFeed as jest.Mock).mockResolvedValueOnce({
      feed: [MOCKED_POSTS[0], MOCKED_POSTS[1], MOCKED_POSTS[2]],
      cursor: 'cursor1',
    });

    const { result } = renderHook(
      () =>
        useHasNewPosts({
          uri: 'test-uri',
          limit: 2,
          pollingInterval: 1000,
          currentFeed,
          isFetching: true,
        }),
      { wrapper }
    );

    // Since polling is disabled when isFetching is true, it should immediately return false.
    expect(result.current).toBe(false);
  });
});
