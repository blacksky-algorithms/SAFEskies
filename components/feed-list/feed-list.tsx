'use client';

import React from 'react';
import { Post } from '@/components/post';
import { type FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

interface FeedListProps {
  feed: FeedViewPost[];
}

export const FeedList = ({ feed }: FeedListProps) => {
  return (
    <ul className='w-full flex flex-col items-center' role='list'>
      {feed.map((feedPost) => (
        <li key={feedPost.post.cid} className='w-full desktop:max-w-screen-lg'>
          <Post post={feedPost.post} />
        </li>
      ))}
    </ul>
  );
};
