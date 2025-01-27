import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import { Icon } from '@/components/icon';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { IconButton } from '@/components/button/icon-button';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

interface Props {
  showModMenu: boolean;
  post: PostView;
  onModAction: (post: PostView) => void;
}

// Post Footer Component
export const PostFooter = (props: Props) => {
  const { showModMenu, post, onModAction } = props;
  const { openModalInstance } = useModal();

  return (
    <>
      <footer className='flex p-4 justify-between items-center text-sm'>
        <span>Posted on: {new Date(post.indexedAt).toLocaleDateString()}</span>
        <div className='flex items-center space-x-4'>
          <PostFooterIcon
            icon='ChatBubbleLeftIcon'
            count={post.replyCount || 0}
            label='replies'
            type={post?.replyCount || 0 > 0 ? 'solid' : 'outline'}
          />
          <PostFooterIcon
            icon='ArrowPathRoundedSquareIcon'
            count={post.repostCount || 0}
            label='reposts'
          />
          <PostFooterIcon
            icon='ChatBubbleLeftRightIcon'
            count={post.quoteCount || 0}
            label='quotes'
            type={post?.quoteCount || 0 > 0 ? 'solid' : 'outline'}
          />
          <PostFooterIcon
            icon='HeartIcon'
            count={post.likeCount || 0}
            label='likes'
            type={post?.likeCount || 0 > 0 ? 'solid' : 'outline'}
          />
          {showModMenu ? (
            <IconButton
              icon='EllipsisHorizontalIcon'
              aria-label='Post actions'
              onClick={(e) => {
                e.stopPropagation();
                onModAction(post);
                openModalInstance(MODAL_INSTANCE_IDS.MOD_MENU, true);
              }}
              size='sm'
              className='h-5 w-5'
              noPadding
            />
          ) : null}
        </div>
      </footer>
    </>
  );
};

// Post Footer Icon Component
const PostFooterIcon = ({
  icon,
  count,
  label,
  type = 'outline',
}: {
  icon: keyof typeof HeroIcons;
  count: number;
  label: string;
  type?: 'solid' | 'outline';
}) => (
  <div className='flex items-center space-x-1'>
    <Icon
      aria-label={label}
      type={type}
      icon={icon}
      className='h-5 w-5 text-app-primary'
    />
    <span>{count}</span>
  </div>
);
