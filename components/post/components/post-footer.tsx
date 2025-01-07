import React from 'react';

import * as HeroIcons from '@heroicons/react/24/outline';
import { Icon } from '@/components/icon';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

// Post Footer Component
export const PostFooter = (postRecord: PostView) => {
  return (
    <footer className='flex p-4 justify-between items-center text-sm'>
      <span>
        Posted on: {new Date(postRecord.indexedAt).toLocaleDateString()}
      </span>
      <div className='flex items-center space-x-4'>
        <PostFooterIcon
          icon='ChatBubbleLeftIcon'
          count={postRecord.replyCount || 0}
          label='replies'
          type={postRecord?.replyCount || 0 > 0 ? 'solid' : 'outline'}
        />
        <PostFooterIcon
          icon='ArrowPathRoundedSquareIcon'
          count={postRecord.repostCount || 0}
          label='reposts'
        />
        <PostFooterIcon
          icon='ChatBubbleLeftRightIcon'
          count={postRecord.quoteCount || 0}
          label='quotes'
          type={postRecord?.quoteCount || 0 > 0 ? 'solid' : 'outline'}
        />
        <PostFooterIcon
          icon='HeartIcon'
          count={postRecord.likeCount || 0}
          label='likes'
          type={postRecord?.likeCount || 0 > 0 ? 'solid' : 'outline'}
        />
      </div>
    </footer>
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
