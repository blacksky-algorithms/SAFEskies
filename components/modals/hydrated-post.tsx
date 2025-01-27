'use client';

import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Post } from '@/components/post';
import { useCallback, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/button';
import { ThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { VisualIntent } from '@/enums/styles';
import cc from 'classcat';

interface HydratedPostModalProps {
  uri: string | null;
  onClose?: () => void;
  onModAction: (post: PostView) => void;
}

interface HydratedPostState {
  thread: ThreadViewPost | null;
  isLoading: boolean;
  error: string | null;
  showReplies: Record<string, boolean>;
}

export const HydratedPostModal = ({
  uri,
  onClose,
  onModAction,
}: HydratedPostModalProps) => {
  const [state, setState] = useState<HydratedPostState>({
    thread: null,
    isLoading: false,
    error: null,
    showReplies: {},
  });

  const fetchPostThread = useCallback(async () => {
    if (!uri) {
      return;
    }
    try {
      const params = new URLSearchParams({
        uri: uri || '',
      });

      const response = await fetch(`/api/post?${params}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch feed');
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        thread: data,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error fetching post thread:', error);
    }
  }, [uri]);

  useEffect(() => {
    fetchPostThread();
  }, [uri, fetchPostThread]);

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
          <div
            className={cc([
              'flex-1',
              {
                'pl-4': depth > 0,
              },
            ])}
          >
            <div className='flex items-center justify-center flex-col'>
              <Post post={reply.post} onModAction={onModAction} />
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
      data-testid='hydrated-post-modal'
      data-uri={uri || ''}
      showBackButton={false}
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
              <Post
                post={state.thread.post}
                onModAction={() => onModAction(state.thread!.post)}
              />

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
