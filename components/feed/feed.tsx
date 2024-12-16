'use client';

import React, { useState, useRef, useCallback } from 'react';
import { usePaginatedFeed } from '@/hooks/usePaginatedFeed';
// import { MODAL_INSTANCE_IDS } from '@/enums/modals';
// import { useModal } from '@/contexts/modal-context';
// import { GenericErrorModal } from '@/components/modals/generic-error-modal';
import { LiveRegion } from '@/components/live-region';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { IconButton } from '@/components/button/icon-button';
import { Post } from '@/components/post';

interface FeedProps {
  did: string;
  feedName: string;
}

export const Feed = ({ did, feedName }: FeedProps) => {
  const {
    feed,
    // error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    refreshFeed,
  } = usePaginatedFeed({
    did,
    feedName,
    limit: 10,
  });

  // const { openModalInstance, closeModalInstance } = useModal();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // // Automatically open the error modal if there is an error
  // useEffect(() => {
  //   if (error) {
  //     openModalInstance(MODAL_INSTANCE_IDS.GENERIC_ERROR, true);
  //   }
  // }, [error, openModalInstance]);

  // Infinite scrolling: Fetch next page when sentinel is visible
  const handleIntersection = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetching, fetchNextPage]
  );

  const sentinelRef = useIntersectionObserver(handleIntersection, {
    root: containerRef.current,
    rootMargin: '150px',
    threshold: 0.1,
  });

  // Pull-to-refresh functionality
  const handlePullToRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshFeed();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Touch handlers for pull-to-refresh
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    containerRef.current!.dataset.touchStartY = e.touches[0].clientY.toString();
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchStartY = parseFloat(
      containerRef.current!.dataset.touchStartY || '0'
    );
    const deltaY = e.touches[0].clientY - touchStartY;
    if (deltaY > 50 && containerRef.current?.scrollTop === 0) {
      handlePullToRefresh();
    }
  };

  // // Refresh feed when error modal is closed
  // const handleErrorModalClose = () => {
  //   closeModalInstance(MODAL_INSTANCE_IDS.GENERIC_ERROR);
  //   refreshFeed();
  // };

  return (
    <div className='relative max-h-page'>
      <section
        className='flex flex-col items-center mx-auto tablet:px-10'
        aria-labelledby={`feed-title-${feedName}`}
      >
        <header className='w-full text-center my-4'>
          <h2 id={`feed-title-${feedName}`} className='text-2xl font-bold'>
            {feedName}
          </h2>
        </header>
        <div
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          className='overflow-y-auto h-screen flex flex-col items-center'
        >
          <LiveRegion>{isRefreshing && <span>Refreshing...</span>}</LiveRegion>

          <ul className='w-screen tablet:max-w-screen-sm flex flex-col items-center'>
            {feed.map((feedPost) => (
              <li
                key={feedPost.post.cid}
                className='w-full tablet:max-w-screen'
              >
                <Post post={feedPost.post} />
              </li>
            ))}
          </ul>

          {isFetching && !isRefreshing && (
            <div className='text-center py-2'>Loading more posts...</div>
          )}

          <div ref={sentinelRef} className='h-10 w-full' />
        </div>
        {/* <GenericErrorModal onClose={handleErrorModalClose}>
          <p>{error || `${feedName} is unavailable`}</p>
        </GenericErrorModal> */}
      </section>
      <IconButton
        icon='ArrowUpCircleIcon'
        aria-label='Return to Top'
        onClick={() =>
          containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }
        className='absolute bottom-4 left-4 h-20 w-20'
      />
    </div>
  );
};
