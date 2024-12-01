import React from 'react';
import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyRichtextFacet,
} from '@atproto/api';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

import { PostFooter } from './components/post-footer';
import { PostHeader } from './components/post-header';
import { PostText } from './components/post-text';
import { EmbedRenderer } from './components/embed-renderer';

interface TextRecord {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
}

export const Post = ({ post }: { post: PostView }) => {
  const { record, author, embed } = post;
  const textRecord = record as TextRecord;

  return (
    <article className='bg-theme-background border border-gray-800 shadow-sm w-full mx-auto max-w-screen'>
      <div className={'p-3 shadow'}>
        <PostHeader author={author} />
        {textRecord?.text && (
          <PostText text={textRecord.text} facets={textRecord.facets} />
        )}

        <EmbedRenderer
          embed={
            embed as
              | AppBskyEmbedVideo.View
              | AppBskyEmbedExternal.View
              | AppBskyEmbedRecord.View
              | AppBskyEmbedRecord.View
              | AppBskyEmbedRecordWithMedia.View
              | AppBskyEmbedImages.View
          }
        />
      </div>
      <PostFooter {...post} />
    </article>
  );
};
