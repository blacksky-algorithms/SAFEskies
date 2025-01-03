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
  // const handleDelete = async () => {
  //   const canRemovePost = await FeedPermissionManager.canPerformAction(
  //     userDID,
  //     'delete_post',
  //     feedUri
  //   );
  //   //TODO: Implement delete post
  // };

  //   if (!uri || !feedUri) return;

  //   setState((prev) => ({ ...prev, isLoading: true, error: null }));

  //   try {
  //     const serviceUrl = process.env.NEXT_PUBLIC_HANDLE_RESOLVER;

  //     // Construct the endpoint URL using the postUri
  //     const endpoint = `${serviceUrl}/queue/posts/delete/${encodeURIComponent(
  //       uri
  //     )}`;

  //     // Send the DELETE request (no feedUri in the payload)
  //     const response = await fetch(endpoint, {
  //       method: 'DELETE',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         feedUri, // Context for which feed the post is being deleted from
  //       }),
  //     });
  //     console.log({ response });
  //     debugger;
  //     if (!response.ok) {
  //       throw new Error('Failed to delete the post from the feed.');
  //     }

  //     // Notify the parent and close the modal after deletion
  //     if (onDelete) {
  //       onDelete();
  //     }
  //     if (onClose) {
  //       onClose();
  //     }
  //   } catch (err) {
  //     console.error('Error deleting post:', err);
  //     debugger;
  //     setState((prev) => ({
  //       ...prev,
  //       error: 'Failed to delete post.',
  //       isLoading: false,
  //     }));
  //   }
  // };

  // const handleDelete = async () => {
  //   if (!uri) return;

  //   setState((prev) => ({ ...prev, isLoading: true, error: null }));

  //   try {
  //     const response = await fetch('/api/feed/delete-post', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         userDid: userDID,
  //         postUri: uri,
  //         feedUri,
  //       }),
  //     });
  //     console.log({ response });
  //     debugger;
  //     if (!response.ok) {
  //       throw new Error('Failed to delete post from the feed.');
  //     }

  //     // // Notify parent or perform any additional actions on success
  //     // if (onDelete) {
  //     //   onDelete();
  //     // }

  //     // // Close the modal after deletion
  //     // if (onClose) {
  //     //   onClose();
  //     // }
  //   } catch (err) {
  //     console.log({ err });
  //     debugger;
  //     console.error('Error deleting post:', err);
  //     setState((prev) => ({
  //       ...prev,
  //       error: 'Failed to delete post.',
  //       isLoading: false,
  //     }));
  //   }
  // };

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
