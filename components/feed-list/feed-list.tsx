'use client';

import React from 'react';
import { Post } from '../post';
import { type FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { Button } from '../button';

interface FeedListProps {
  feed: FeedViewPost[];
  fetchNextPage: () => void;
}

export const FeedList = ({ feed, fetchNextPage }: FeedListProps) => {
  return (
    <ul className='w-full flex flex-col items-center' role='list'>
      {feed.map((feedPost) => (
        <li key={feedPost.post.cid} className='w-full desktop:max-w-screen-lg'>
          <Post post={feedPost.post} />
        </li>
      ))}
      <Button onClick={fetchNextPage}>Load more</Button>
    </ul>
  );
};
