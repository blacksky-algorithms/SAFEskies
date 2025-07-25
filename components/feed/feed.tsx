'use client';

import React, { useCallback, useEffect } from 'react';
import { useHasNewPosts, usePaginatedFeed } from '@/hooks/usePaginatedFeed';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import { GenericErrorModal } from '@/components/modals/generic-error-modal';
import { LiveRegion } from '@/components/live-region';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { IconButton } from '@/components/button/icon-button';
import { Post } from '@/components/post';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { VisualIntent } from '@/enums/styles';
import { ModMenuModal } from '../modals/mod-menu';
import { ReportPostModal } from '../modals/report-post';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useModeration } from '@/hooks/useModeration';
import { ModerationService } from '@/lib/types/moderation';
import { ConfirmRemovePostModal } from '../modals/remove-post-modal';
import cc from 'classcat';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleHasModServices } from '@/lib/utils/handleHasModServices';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

interface FeedProps {
  onRefreshComplete?: () => void;
  displayName: string | undefined;
  services: ModerationService[] | [];
  isSignedIn: boolean;
}

export const Feed = ({
  onRefreshComplete,
  displayName = 'Unknown Feed Name',
  services,
  isSignedIn,
}: FeedProps) => {
  const hasModServices = handleHasModServices(isSignedIn, services);
  const {
    feed,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refreshFeed,
  } = usePaginatedFeed();
  const searchParams = useSearchParams();
  const uri = searchParams.get('uri');
  const hasNewPosts = useHasNewPosts({
    currentFeed: feed,
    isFetching,
    uri,
  });

  const { containerRef, isRefreshing, handleTouchStart, handleTouchMove } =
    usePullToRefresh({
      onRefresh: async () => {
        await refreshFeed();
        onRefreshComplete?.();
      },
    });

  const { openModalInstance, closeModalInstance } = useModal();

  const {
    reportData,
    isReportSubmitting,
    handleSelectReportReason,
    handleReportPost,
    handleAddtlInfoChange,
    handleReportToChange,
    isModServiceChecked,
    onClose,
    handleDirectRemove,
    handlePrepareDirectRemove,
  } = useModeration({ displayName, services });

  // Simplified scroll restoration hook
  const { containerRef: scrollContainerRef } = useScrollRestoration({
    key: displayName,
    shouldRestore: !!uri, // Restore when coming back from a post
    shouldClear: !uri,    // Clear when switching feeds or refreshing
  });

  // Simplified: Just use the scroll restoration ref directly
  const setContainerRef = useCallback((element: HTMLDivElement | null) => {
    // Assign to pull-to-refresh ref
    if (containerRef && 'current' in containerRef) {
      (containerRef.current as HTMLDivElement | null) = element;
    }
    // Assign to scroll restoration ref  
    if (scrollContainerRef && 'current' in scrollContainerRef) {
      (scrollContainerRef.current as HTMLElement | null) = element;
    }
  }, [containerRef, scrollContainerRef]);

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
  const router = useRouter();
  const handlePostClick = async (
    event: React.SyntheticEvent,
    post: PostView
  ) => {
    if (uri) {
      router.push(
        `/post/${encodeURIComponent(post.uri)}?feed=${encodeURIComponent(
          displayName
        )}&uri=${encodeURIComponent(uri)}`
      );
    }
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
            ref={setContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className='overflow-y-auto h-screen flex flex-col items-center'
          >
            <LiveRegion>
              {isRefreshing && <span>Refreshing...</span>}
            </LiveRegion>

            <ul className='w-screen tablet:max-w-screen-sm flex flex-col items-center'>
              {feed.map((feedPost) => {
                const { post, reply } = feedPost;

                // Correctly extract parent and root
                const parentPost = reply?.parent ?? null;
                const rootPost = reply?.root ?? null;
                const shouldRenderParentPost =
                  parentPost &&
                  rootPost &&
                  (parentPost.uri !== rootPost.uri ||
                    parentPost.cid !== rootPost.cid);
                return (
                  <li
                    key={post.cid}
                    className='w-full tablet:max-w-screen'
                    onClick={(event) => handlePostClick(event, post)}
                  >
                    <Post
                      post={post}
                      parentPost={
                        shouldRenderParentPost ? (parentPost as PostView) : null
                      }
                      rootPost={rootPost as PostView}
                      onModAction={handlePrepareDirectRemove}
                      showModMenu={hasModServices}
                      isSignedIn={isSignedIn}
                    />
                  </li>
                );
              })}
            </ul>

            {isFetching && !isRefreshing && (
              <div className='text-center py-2'>Loading more posts...</div>
            )}

            <div ref={sentinelRef} className='h-10 w-full' />
          </div>
          <GenericErrorModal onClose={handleErrorModalClose}>
            <p>
              {error instanceof Error
                ? error.message
                : 'An unknown error occurred'}
            </p>
          </GenericErrorModal>
          <IconButton
            intent={VisualIntent.Info}
            icon={
              isFetching && !isFetchingNextPage
                ? 'RocketLaunchIcon'
                : 'ArrowUpCircleIcon'
            }
            aria-label='Return to Top'
            onClick={() => {
              refreshFeed();
              containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cc([
              'absolute bottom-4 left-4 h-14 w-14 ',
              {
                'bg-app-secondary-hover': !hasNewPosts,
                'bg-app-primary': hasNewPosts,
              },
            ])}
            iconType='solid'
          />
        </section>
      </div>
      {hasModServices ? (
        <>
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
            handleAddtlInfoChange={handleAddtlInfoChange}
            services={services}
          />
          <ConfirmRemovePostModal
            post={reportData.post}
            onClose={() =>
              closeModalInstance(MODAL_INSTANCE_IDS.CONFIRM_REMOVE)
            }
            handleDirectRemove={handleDirectRemove}
            isSubmitting={isReportSubmitting}
            feedName={displayName}
          />
        </>
      ) : null}
    </>
  );
};
