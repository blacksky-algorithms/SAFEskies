'use client';

import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Post } from '@/components/post';
import { useEffect, useState } from 'react';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/button';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { VisualIntent } from '@/enums/styles';

interface HydratedPostModalProps {
  uri: string | null;
  feedUri: string;
  userDID: string;
  onClose?: () => void;
  onDelete?: () => void;
}

interface HydratedPostState {
  thread: ThreadViewPost | null;
  isLoading: boolean;
  error: string | null;
  showReplies: Record<string, boolean>;
}

export const HydratedPostModal = ({
  uri,
  // feedUri,
  // userDID,
  onClose,
}: // onDelete,
// feedData,
HydratedPostModalProps) => {
  const [state, setState] = useState<HydratedPostState>({
    thread: null,
    isLoading: false,
    error: null,
    showReplies: {},
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!uri) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const thread = await FeedPermissionManager.getPostThread(uri);
        setState((prev) => ({
          ...prev,
          thread,
          isLoading: false,
        }));
      } catch (err) {
        console.error('Error fetching post:', err);
        setState((prev) => ({
          ...prev,
          error: 'Failed to load post',
          isLoading: false,
        }));
      }
    };

    fetchPost();
  }, [uri]);

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
      <div key={reply.post.uri} className='ml-4 w-full'>
        <div className='flex'>
          {depth > 0 && (
            <div className='w-px bg-gray-300 self-stretch mr-4'></div>
          )}
          <div className='flex-1'>
            <div className='flex items-center justify-center flex-col'>
              <Post post={reply.post} />
              {reply.replies && reply.replies?.length > 0 && (
                <div>
                  <Button
                    onClick={() => handleReplyToggle(reply.post.uri)}
                    intent={VisualIntent.TextButton}
                  >
                    {isExpanded
                      ? 'Hide replies'
                      : `Show replies (${reply.replies.length})`}
                  </Button>
                </div>
              )}
            </div>

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

  return (
    <Modal
      id={MODAL_INSTANCE_IDS.HYDRATED_POST}
      size='full'
      onClose={onClose}
      noContentPadding
    >
      <div className='flex flex-col h-full pb-20 overflow-auto w-full bg-app-background'>
        {state.isLoading && (
          <div className='flex justify-center p-4'>
            <LoadingSpinner />
          </div>
        )}

        {state.thread && (
          <div className='max-w-2xl mx-auto w-full'>
            <div className='flex-1 overflow-auto '>
              <Post post={state.thread.post} />

              {state.thread.replies?.map((reply) =>
                renderReply(reply as ThreadViewPost)
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
