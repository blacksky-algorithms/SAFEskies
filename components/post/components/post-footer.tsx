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
        />
        <PostFooterIcon
          icon='ArrowPathRoundedSquareIcon'
          count={postRecord.repostCount || 0}
          label='reposts'
        />
        <PostFooterIcon
          icon='HeartIcon'
          count={postRecord.likeCount || 0}
          label='likes'
        />
        <PostFooterIcon
          icon='LinkIcon'
          count={postRecord.quoteCount || 0}
          label='quotes'
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
}: {
  icon: keyof typeof HeroIcons;
  count: number;
  label: string;
}) => (
  <div className='flex items-center space-x-1'>
    <Icon aria-label={label} icon={icon} className='h-5 w-5 text-app-primary' />
    <span>{count}</span>
  </div>
);
