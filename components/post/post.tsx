import React from 'react';
import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyRichtextFacet,
} from '@atproto/api/dist/client';

import { OptimizedImage } from '@/components/optimized-image';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import {
  PostFooter,
  PostHeader,
  PostImages,
  PostText,
} from './post-components';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

type EmbedType =
  | AppBskyEmbedImages.View
  | AppBskyEmbedVideo.View
  | AppBskyEmbedExternal.View
  | AppBskyEmbedRecord.View
  | AppBskyEmbedRecordWithMedia.View;
interface TextRecord {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
}
// Post Content Component
export const PostContent = ({
  post,
}: {
  post: PostView;
  isEmbedded?: boolean;
}) => {
  const { record, author, embed } = post;
  const textRecord = record as TextRecord;

  return (
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
  );
};

export const EmbedVideoView = ({
  embed,
}: {
  embed: AppBskyEmbedVideo.View;
}) => {
  return (
    <div className='relative mt-4 mx-auto'>
      <video
        controls
        playsInline
        poster={embed.thumbnail}
        className='object-cover w-full rounded-md'
      >
        <source src={embed.playlist || ''} type='application/x-mpegURL' />
      </video>
    </div>
  );
};

const EmbedExternal = ({ embed }: { embed: AppBskyEmbedExternal.View }) => {
  const { uri, title, description, thumb } = embed.external;

  const isGif = uri.includes('.gif') || thumb?.endsWith('.gif');

  return (
    <div className='mt-4 border border-gray-800 rounded-md p-2'>
      {isGif ? (
        <OptimizedImage
          src={uri}
          alt={description ?? title}
          className='rounded-md mx-auto'
        />
      ) : (
        <a href={uri} target='_blank' rel='noopener noreferrer'>
          <div className='flex flex-col'>
            <OptimizedImage src={thumb} alt={title} className='rounded-md' />
            <div className='mt-2'>
              <h4 className='text-sm font-bold'>{title}</h4>
              <p className='text-xs text-gray-500'>{description}</p>
            </div>
          </div>
        </a>
      )}
    </div>
  );
};

const EmbeddedPostView = ({ embed }: { embed: AppBskyEmbedRecord.View }) => {
  const record = embed.record;

  if (!record) return null;

  const text = (record.value as { text?: string }).text || '';
  const author = record.author as ProfileViewBasic;
  const nestedEmbed = (record as { embed?: AppBskyEmbedRecord.View }).embed;

  return (
    <div className='m-4 p-2 border border-gray-800 rounded-md'>
      <PostHeader author={author} />
      {text && <PostText text={text} />}
      {nestedEmbed && <EmbedRenderer embed={nestedEmbed} />}
    </div>
  );
};

const EmbedRenderer = ({
  embed,
}: {
  embed?:
    | AppBskyEmbedVideo.View
    | AppBskyEmbedExternal.View
    | AppBskyEmbedRecord.View
    | AppBskyEmbedRecord.View
    | AppBskyEmbedRecordWithMedia.View
    | AppBskyEmbedImages.View;
}) => {
  if (!embed) return null;

  switch (embed.$type) {
    case 'app.bsky.embed.external#view':
      return <EmbedExternal embed={embed as AppBskyEmbedExternal.View} />;

    case 'app.bsky.embed.record#view':
      return <EmbeddedPostView embed={embed as AppBskyEmbedRecord.View} />;

    case 'app.bsky.embed.recordWithMedia#view':
      const recordWithMedia = embed as AppBskyEmbedRecordWithMedia.View;
      return (
        <div className='mt-4'>
          {recordWithMedia.media && (
            <EmbedRenderer
              embed={
                recordWithMedia.media as
                  | AppBskyEmbedVideo.View
                  | AppBskyEmbedExternal.View
                  | AppBskyEmbedRecord.View
                  | AppBskyEmbedRecord.View
                  | AppBskyEmbedRecordWithMedia.View
              }
            />
          )}
          {recordWithMedia.record && (
            <EmbeddedPostView
              embed={recordWithMedia.record as AppBskyEmbedRecord.View}
            />
          )}
        </div>
      );

    case 'app.bsky.embed.video#view':
      return <EmbedVideoView embed={embed as AppBskyEmbedVideo.View} />;

    case 'app.bsky.embed.images#view':
      return <PostImages images={(embed as AppBskyEmbedImages.View).images} />;

    default:
      console.warn('Unsupported embed type:', embed.$type);
      return null;
  }
};

// Main Post Component
export const Post = ({ post }: { post: PostView }) => (
  <article className='bg-theme-background border border-gray-800 shadow-sm w-full mx-auto max-w-screen'>
    <PostContent post={post} />
    <PostFooter {...post} />
  </article>
);
