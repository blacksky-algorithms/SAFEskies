'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FeedList } from '@/components/feed-list/feed-list';
import { usePaginatedFeed } from '@/hooks/usePaginatedFeed';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import { GenericErrorModal } from '@/components/modals/generic-error-modal';

interface FeedProps {
  did: string;
  feedName: string;
}

const Feed = ({ did, feedName }: FeedProps) => {
  const { feed, error, isFetching, hasNextPage, fetchNextPage, refreshFeed } =
    usePaginatedFeed({
      did,
      feedName,
      limit: 10,
    });

  const { openModalInstance } = useModal();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle error modal opening when an error occurs
  useEffect(() => {
    if (error) {
      openModalInstance(MODAL_INSTANCE_IDS.GENERIC_ERROR, true);
    }
  }, [error, openModalInstance]);

  // Infinite scroll for loading more items
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        hasNextPage &&
        !isFetching
      ) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetching, fetchNextPage]);

  // Pull-to-refresh functionality
  const handlePullToRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refreshFeed();
    setIsRefreshing(false);
  };

  // Function to refetch feed when error modal is closed
  const handleErrorModalClose = () => {
    refreshFeed();
  };

  return (
    <>
      {isFetching && feed.length === 0 ? (
        <div className='flex items-center justify-center'>Loading...</div>
      ) : !feed || (feed.length === 0 && !isFetching) ? (
        <div className='flex items-center justify-center'>It&apos;s dry</div>
      ) : (
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
          className='overflow-y-auto h-screen flex flex-col items-center'
        >
          {isRefreshing && (
            <div className='refresh-indicator'>Refreshing...</div>
          )}
          <FeedList feed={feed} feedName={feedName} />
        </div>
      )}
      <GenericErrorModal onClose={handleErrorModalClose}>
        <p>{`${feedName} is unavailable`}</p>
      </GenericErrorModal>
    </>
  );
};

export default Feed;
