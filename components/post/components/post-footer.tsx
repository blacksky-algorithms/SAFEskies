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

  // create a function that calculates the number of reposts and quotes. Once the number reaches the thoushads it should be displayed as 1k, 2.3k, 3k, etc.
  const formatCount = (count: number) => {
    if (count < 1000) {
      return count;
    }
    return `${Math.floor(count / 1000)}k`;
  };

  return (
    <>
      <footer className='flex py-2 px-8 justify-between items-center text-sm'>
        <PostFooterIcon
          icon='ChatBubbleLeftIcon'
          count={formatCount(post.replyCount || 0)}
          label='replies'
          type={post?.replyCount || 0 > 0 ? 'solid' : 'outline'}
        />
        <PostFooterIcon
          icon='ArrowPathRoundedSquareIcon'
          count={formatCount((post.repostCount || 0) + (post.quoteCount || 0))}
          label='reposts'
        />
        <PostFooterIcon
          icon='HeartIcon'
          count={formatCount(post.likeCount || 0)}
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
  count: number | string;
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
