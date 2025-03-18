'use client';

import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { Button } from '@/components/button';
import { Post } from '@/components/post';
import { VisualIntent } from '@/enums/styles';

interface ConfirmRemovePostModalProps {
  post: PostView | null;
  onClose: () => void;
  handleDirectRemove: () => void;
  isSubmitting: boolean;
  feedName?: string;
}

export const ConfirmRemovePostModal = ({
  post,
  onClose,
  handleDirectRemove,
  isSubmitting,
  feedName = 'this feed',
}: ConfirmRemovePostModalProps) => {
  return (
    <Modal
      id={MODAL_INSTANCE_IDS.CONFIRM_REMOVE}
      title='Remove this post?'
      size='large'
      onClose={onClose}
      footer={
        <div className='flex justify-end w-full gap-3'>
          <Button
            intent={VisualIntent.Secondary}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            intent={VisualIntent.Error}
            onClick={handleDirectRemove}
            disabled={isSubmitting}
          >
            Remove
          </Button>
        </div>
      }
    >
      <div className='mb-4'>
        <p className='text-app-secondary mb-4'>
          {`This post will be removed from ${feedName}.`}
        </p>

        {post ? (
          <div className='border border-app-border rounded-lg overflow-hidden'>
            <Post
              post={post}
              parentPost={null}
              rootPost={null}
              showModMenu={false}
              isSignedIn={true}
              onModAction={() => {}}
            />
          </div>
        ) : (
          <div className='p-6 text-center text-app-secondary bg-app-background-secondary rounded-lg'>
            Post not available
          </div>
        )}
      </div>
    </Modal>
  );
};
