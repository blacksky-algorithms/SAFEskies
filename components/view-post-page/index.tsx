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
import { VisualIntent } from '@/enums/styles';
import cc from 'classcat';

interface ViewPostPageProps {
  data: NotFoundPost | BlockedPost | ThreadViewPost | [];
  onClose?: () => void;

  isSignedIn: boolean;
}

interface ViewPostPageState {
  thread: NotFoundPost | BlockedPost | ThreadViewPost | [];
  isLoading: boolean;
  error: string | null;
  showReplies: Record<string, boolean>;
}

export const ViewPostPage = ({ data, isSignedIn }: ViewPostPageProps) => {
  const [state, setState] = useState<ViewPostPageState>({
    thread: data,
    isLoading: false,
    error: null,
    showReplies: {},
  });

  console.log('ViewPostPage data', data);
  // console.log('isThreadViewPost', isThreadViewPost(data?.thread));

  const onModAction = (post: PostView) => {
    console.log('onModAction', post);
  };
  const showModMenu = true;

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
              onModAction={onModAction}
              showModMenu={showModMenu}
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
      <div className='flex flex-col h-full pb-20 overflow-auto w-full bg-app-background'>
        {state.isLoading && (
          <div className='flex justify-center p-4'>
            <LoadingSpinner />
          </div>
        )}

        {state.thread && (
          <div className='max-w-2xl mx-auto w-full'>
            <div className='flex-1 overflow-auto'>
              <Post
                post={state.thread.post}
                parentPost={(state.thread.parent?.post as PostView) || null}
                rootPost={(state.thread.parent?.post as PostView) || null}
                onModAction={onModAction}
                showModMenu={showModMenu}
                isSignedIn={isSignedIn}
              />
              {state.thread.replies?.map((reply) =>
                renderReply(reply as ThreadViewPost)
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
};
