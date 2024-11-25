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
        const { feed, cursor: nextPage } = data;

        setPosts(feed as unknown as PostType[]);
      } catch (error) {
        console.error({ error });
        // TODO: Handle error
      }
    };
    getFeed();
  }, []);

  return (
    <div>
      <h1>{feedName}</h1>
      <ul>
        {posts.map(({ post }) => {
          return (
            <li key={post.cid}>
              <Post post={post} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
