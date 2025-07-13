'use client';

import {
  BlockedPost,
  isBlockedPost,
  isNotFoundPost,
  isThreadViewPost,
  NotFoundPost,
  PostView,
} from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { Post } from '@/components/post';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/button';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { ModerationService } from '@/lib/types/moderation';
import { VisualIntent } from '@/enums/styles';
import cc from 'classcat';
import { useModeration } from '@/hooks/useModeration';
import { ModMenuModal } from '../modals/mod-menu';
import { ReportPostModal } from '../modals/report-post';
import { ConfirmRemovePostModal } from '../modals/remove-post-modal';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { handleHasModServices } from '@/lib/utils/handleHasModServices';

interface ViewPostPageProps {
  data:
    | NotFoundPost
    | BlockedPost
    | ThreadViewPost
    | { [k: string]: unknown; $type: string }
    | [];
  services: ModerationService[] | [];
  isSignedIn: boolean;
  feedDisplayName: string;
}

interface ViewPostPageState {
  thread: ViewPostPageProps['data'];
  isLoading: boolean;
  error: string | null;
  showReplies: Record<string, boolean>;
  postUri?: string | null;
}

export const ViewPostPage = ({
  data,
  isSignedIn,
  feedDisplayName,
  services,
}: ViewPostPageProps) => {
  const [state, setState] = useState<ViewPostPageState>({
    thread: data,
    isLoading: false,
    error: null,
    showReplies: {},
  });

  const { closeModalInstance } = useModal();

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
  } = useModeration({ displayName: feedDisplayName, services });

  const hasModServices = handleHasModServices(isSignedIn, services);

  const handleReplyToggle = (replyUri: string) => {
    setState((prev) => ({
      ...prev,
      showReplies: {
        ...prev.showReplies,
        [replyUri]: !prev.showReplies[replyUri],
      },
    }));
  };

  const renderReply = (reply: ThreadViewPost, depth = 0) => {
    const isExpanded = state.showReplies[reply.post.uri];

    return (
      <div key={reply.post.uri} className='w-full'>
        <div className='flex'>
          <div className={cc(['flex-1', { 'pl-4': depth > 0 }])}>
            <Post
              post={reply.post}
              parentPost={(reply.parent?.post as PostView) || null}
              rootPost={(reply.parent?.post as PostView) || null}
              onModAction={handlePrepareDirectRemove}
              showModMenu={hasModServices}
              isSignedIn={isSignedIn}
            />
            {reply.replies && reply.replies.length > 0 && (
              <Button
                onClick={() => handleReplyToggle(reply.post.uri)}
                intent={VisualIntent.TextButton}
              >
                {isExpanded
                  ? 'Hide replies'
                  : `Show replies (${reply.replies.length})`}
              </Button>
            )}
            {isExpanded && (
              <div className='mt-2 w-full'>
                {reply.replies?.map((subReply) =>
                  renderReply(subReply as ThreadViewPost, depth + 1)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (state.isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <LoadingSpinner />
      </div>
    );
  }

  if (isNotFoundPost(state.thread)) {
    return (
      <div className='flex justify-center items-center h-full'>
        No post found
      </div>
    );
  }

  if (isBlockedPost(state.thread)) {
    return (
      <div className='flex justify-center items-center h-full'>
        <div className='p-4'>
          <h2 className='text-lg font-bold'>Blocked</h2>
          <p>This post has been blocked.</p>
        </div>
      </div>
    );
  }

  if (isThreadViewPost(state.thread)) {
    return (
      <>
        <div className='h-full w-full bg-app-background overflow-y-auto overflow-x-hidden' style={{ WebkitOverflowScrolling: 'touch' }}>
          {state.isLoading && (
            <div className='flex justify-center p-4'>
              <LoadingSpinner />
            </div>
          )}

          {state.thread && (
            <div className='pb-20'>
              <div className='max-w-2xl mx-auto w-full p-4'>
                <Post
                  post={state.thread.post}
                  parentPost={(state.thread.parent?.post as PostView) || null}
                  rootPost={(state.thread.parent?.post as PostView) || null}
                  onModAction={handlePrepareDirectRemove}
                  showModMenu={hasModServices}
                  isSignedIn={isSignedIn}
                />
                {state.thread.replies?.map((reply) =>
                  renderReply(reply as ThreadViewPost)
                )}
              </div>
            </div>
          )}
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
              feedName={feedDisplayName}
            />
          </>
        ) : null}
      </>
    );
  }
};
