'use client';

import { useEffect, useState } from 'react';
import { AtpAgent } from '@atproto/api';
import React from 'react';
import { PostType } from '@/types/post';
import { preferredLanguages } from '@/utils/todo';
import { Post } from '../post';

export const agent = new AtpAgent({
  // App View URL
  service: 'https://api.bsky.app',
  // If you were making an authenticated client, you would
  // use the PDS URL here instead - the main one is bsky.social
  // service: "https://bsky.social",
});

type FeedListProps = { did: string; feedName: string };

export const FeedList = (props: FeedListProps) => {
  const [posts, setPosts] = useState<PostType[] | []>([]);
  const { did, feedName } = props;

  useEffect(() => {
    const getFeed = async () => {
      try {
        const { data } = await agent.app.bsky.feed.getFeed(
          {
            feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
            limit: 30,
          },
          {
            headers: {
              'Accept-Language': preferredLanguages,
            },
          }
        );
        const { feed } = data;

        setPosts(feed as unknown as PostType[]);
      } catch (error) {
        console.error({ error });
        // TODO: Handle error
      }
    };
    getFeed();
  }, []);

  return (
    <section
      className='flex w-full flex-col items-center'
      aria-labelledby={`feed-title-${feedName}`}
    >
      <header className='w-full text-center my-4'>
        <h1
          id={`feed-title-${feedName}`}
          className='text-2xl font-bold text-white'
        >
          {feedName}
        </h1>
      </header>

      {/* Feed Posts */}
      <ul className='' role='list'>
        {posts.map(({ post }) => (
          <li key={post.cid} className='mb-4'>
            <Post post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
};
