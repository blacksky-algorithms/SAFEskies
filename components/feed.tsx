'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FeedList } from '@/components/feed-list/feed-list';
import { usePaginatedFeed } from '@/hooks/usePaginatedFeed';

interface FeedProps {
  did: string;
  feedName: string;
}

const Feed = (props: FeedProps) => {
  const { did, feedName } = props;
  const { feed, error, isFetching, hasNextPage, fetchNextPage, refreshFeed } =
    usePaginatedFeed({
      did,
      feedName,
      limit: 10,
    });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasNextPage &&
      !isFetching
    ) {
      console.log('Triggering fetchNextPage');
      fetchNextPage();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetching]);

  const handlePullToRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    console.log('Pull to Refresh Triggered');
    await refreshFeed();
    setIsRefreshing(false);
  };

  console.log('Feed State:', { feed, error, isFetching, hasNextPage });

  if (error) return <div>Error: {JSON.stringify(error)}</div>;
  if (!feed || feed.length === 0) return <div>No feed</div>;

  return (
    <div
      ref={containerRef}
      onTouchStart={(e) =>
        (containerRef.current!.dataset.touchStartY =
          e.touches[0].clientY.toString())
      }
      onTouchMove={(e) => {
        const touchStartY = parseFloat(
          containerRef.current!.dataset.touchStartY || '0'
        );
        const deltaY = e.touches[0].clientY - touchStartY;
        if (deltaY > 50 && containerRef.current?.scrollTop === 0)
          handlePullToRefresh();
      }}
      className='overflow-y-auto h-screen'
    >
      {isRefreshing && <div className='refresh-indicator'>Refreshing...</div>}
      <FeedList feed={feed} feedName={feedName} />
    </div>
  );
};

export default Feed;
