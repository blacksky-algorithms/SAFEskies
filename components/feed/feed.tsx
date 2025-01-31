'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePaginatedFeed } from '@/hooks/usePaginatedFeed';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import { GenericErrorModal } from '@/components/modals/generic-error-modal';
import { LiveRegion } from '@/components/live-region';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { IconButton } from '@/components/button/icon-button';
import { Post } from '@/components/post';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { HydratedPostModal } from '../modals/hydrated-post';
import { VisualIntent } from '@/enums/styles';
import { ModMenuModal } from '../modals/mod-menu';
import { ReportPostModal } from '../modals/report-post';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useModeration } from '@/hooks/useModeration';
import { useProfileData } from '@/hooks/useProfileData';
import { canPerformAction } from '@/repos/permission';

interface FeedProps {
  onRefreshComplete?: () => void;
  feedName: string | undefined;
}

export const Feed = ({ onRefreshComplete, feedName }: FeedProps) => {
  const searchParams = useSearchParams();
  const uri = searchParams.get('uri');
  const { feed, error, isFetching, hasNextPage, fetchNextPage, refreshFeed } =
    usePaginatedFeed({
      limit: 10,
      uri,
    });

  const { containerRef, isRefreshing, handleTouchStart, handleTouchMove } =
    usePullToRefresh({
      onRefresh: async () => {
        await refreshFeed();
        onRefreshComplete?.();
      },
    });

  const { profile, isLoading } = useProfileData();
  const { openModalInstance, closeModalInstance } = useModal();
  const [viewedPostUri, setViewedPostUri] = useState<string | null>(null);
  const [showModMenu, setShowModMenu] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!profile || isLoading) {
        setShowModMenu(false);
        return;
      }
      const hasModPermissions = await canPerformAction(
        profile.did,
        'mod_promote',
        uri
      );
      setShowModMenu(hasModPermissions);
    };
    checkRole();
  }, [uri, profile, isLoading]);

  const {
    reportData,
    isReportSubmitting,
    handleModAction,
    handleSelectReportReason,
    handleReportPost,
    handleReportToChange,
    isModServiceChecked,
    onClose,
  } = useModeration({ feedUri: uri!, feedName, feed });

  useEffect(() => {
    if (error) {
      openModalInstance(MODAL_INSTANCE_IDS.GENERIC_ERROR, true);
    }
  }, [error, openModalInstance]);

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

  const handlePostClick = async (post: PostView) => {
    setViewedPostUri(post.uri);
    openModalInstance(MODAL_INSTANCE_IDS.HYDRATED_POST, true);
  };

  const handleErrorModalClose = () => {
    closeModalInstance(MODAL_INSTANCE_IDS.GENERIC_ERROR);
    refreshFeed();
  };

  return (
    <>
      <div className='max-h-page'>
        <section className='flex flex-col items-center mx-auto tablet:px-10'>
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className='overflow-y-auto h-screen flex flex-col items-center'
          >
            <LiveRegion>
              {isRefreshing && <span>Refreshing...</span>}
            </LiveRegion>

            <ul className='w-screen tablet:max-w-screen-sm flex flex-col items-center'>
              {feed.map((feedPost) => (
                <li
                  key={feedPost.post.cid}
                  className='w-full tablet:max-w-screen'
                  onClick={() => handlePostClick(feedPost.post)}
                >
                  <Post
                    post={feedPost.post}
                    onModAction={handleModAction}
                    showModMenu={showModMenu}
                  />
                </li>
              ))}
            </ul>

            {isFetching && !isRefreshing && (
              <div className='text-center py-2'>Loading more posts...</div>
            )}

            <div ref={sentinelRef} className='h-10 w-full' />
          </div>
          <GenericErrorModal onClose={handleErrorModalClose}>
            <p>{error || 'Feed unavailable'}</p>
          </GenericErrorModal>
        </section>
        <IconButton
          intent={VisualIntent.Info}
          icon='ArrowUpCircleIcon'
          aria-label='Return to Top'
          onClick={() =>
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          }
          className='fixed bottom-4 left-4 h-14 w-14 bg-app-secondary-hover'
          iconType='solid'
        />
      </div>
      <HydratedPostModal
        uri={viewedPostUri}
        onClose={() => setViewedPostUri(null)}
        onModAction={handleModAction}
        showModMenu={showModMenu}
      />
      <ModMenuModal
        onClose={onClose}
        handleSelectReportReason={handleSelectReportReason}
      />
      <ReportPostModal
        onClose={onClose}
        onReport={handleReportPost}
        reason={reportData.reason}
        isReportSubmitting={isReportSubmitting}
        handleReportToChange={handleReportToChange}
        isModServiceChecked={isModServiceChecked}
        isDisabled={reportData.toServices.length === 0}
      />
    </>
  );
};
