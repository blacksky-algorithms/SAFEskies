import React from 'react';
import { AppBskyRichtextFacet } from '@atproto/api';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

import { PostFooter } from './components/post-footer';
import { PostHeader } from './components/post-header';
import { PostText } from './components/post-text';
import { EmbedRenderer } from './components/embed-renderer';

interface TextRecord {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
}

export const Post = ({
  post,
  onModAction,
  showModMenu,
}: {
  post: PostView;
  onModAction: (post: PostView) => void;
  showModMenu: boolean;
}) => {
  const { record, author, embed } = post;
  const textRecord = record as TextRecord;

  return (
    <>
      <article className='bg-app-background border border-gray-800 shadow-sm w-full mx-auto max-w-screen'>
        <div className={'p-3 shadow'}>
          <PostHeader author={author} postIndexedAt={post.indexedAt} />
          {textRecord?.text && (
            <PostText text={textRecord.text} facets={textRecord.facets} />
          )}

          <EmbedRenderer content={embed} labels={post.labels} />
        </div>
        <PostFooter
          showModMenu={showModMenu}
          post={post}
          onModAction={onModAction}
        />
      </article>
    </>
  );
};
