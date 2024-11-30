import React from 'react';
import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyRichtextFacet,
} from '@atproto/api/dist/client';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { OptimizedImage } from '@/components/optimized-image';
import { Icon } from '@/components/icon';
import cc from 'classcat';

// Define a type for text-based records if none exists
interface TextRecord {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
}

// Post Content Component
export const PostContent = ({ post }: { post: PostView }) => {
  const { record, author, embed } = post;

  // Safely cast the record to TextRecord
  const textRecord = record as TextRecord;

  const renderLinks = (
    text: string,
    facets: AppBskyRichtextFacet.Main[] = []
  ) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    facets.forEach((facet, idx) => {
      const { byteStart, byteEnd } = facet.index;
      const feature = facet.features[0];

      if (lastIndex < byteStart) {
        elements.push(
          <span key={`text-${idx}`}>{text.slice(lastIndex, byteStart)}</span>
        );
      }

      if (feature.$type === 'app.bsky.richtext.facet#link') {
        elements.push(
          <a
            key={`link-${idx}`}
            href={feature.uri || ''}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 underline'
          >
            {text.slice(byteStart, byteEnd)}
          </a>
        );
      }

      lastIndex = byteEnd;
    });

    if (lastIndex < text.length) {
      elements.push(<span key='remaining-text'>{text.slice(lastIndex)}</span>);
    }

    return <p>{elements}</p>;
  };

  return (
    <div className='post-content p-3 border border-gray-300 rounded shadow'>
      {author && (
        <div className='author-info mb-2 flex items-center'>
          <OptimizedImage
            src={author.avatar || ''}
            alt={`Avatar of ${author.displayName || author.handle}`}
            className='w-8 h-8 rounded-full mr-2'
          />
          <div>
            <p className='font-semibold'>
              {author.displayName || author.handle}
            </p>
            <p className='text-sm text-gray-500'>@{author.handle}</p>
          </div>
        </div>
      )}
      {textRecord.text && renderLinks(textRecord.text, textRecord.facets || [])}
      {embed && <EmbedRenderer embed={embed} />}
    </div>
  );
};

// Embed Renderer Component
export const EmbedRenderer = ({
  embed,
}: {
  embed:
    | AppBskyEmbedImages.View
    | AppBskyEmbedVideo.View
    | AppBskyEmbedExternal.View
    | AppBskyEmbedRecord.View
    | AppBskyEmbedRecordWithMedia.View;
}) => {
  switch (embed.$type) {
    case 'app.bsky.embed.images#view':
      return (
        <div className='mt-4 grid gap-2 grid-cols-2'>
          {(embed as AppBskyEmbedImages.View).images.map((image, index) => (
            <OptimizedImage
              key={index}
              src={image.fullsize || image.thumb}
              alt={image.alt || 'Image'}
              className='rounded-md object-cover w-full'
            />
          ))}
        </div>
      );

    case 'app.bsky.embed.video#view':
      return (
        <div className='relative mt-4'>
          <video
            controls
            playsInline
            poster={(embed as AppBskyEmbedVideo.View).thumbnail}
            className='object-cover w-full rounded-md'
          >
            <source
              src={(embed as AppBskyEmbedVideo.View).playlist || ''}
              type='application/x-mpegURL'
            />
          </video>
        </div>
      );

    case 'app.bsky.embed.external#view':
      return (
        <a
          href={embed.uri || ''}
          target='_blank'
          rel='noopener noreferrer'
          className='block mt-4 p-3 border border-gray-300 rounded-md shadow-md hover:shadow-lg transition-shadow'
        >
          {embed.thumb && (
            <OptimizedImage
              src={embed.thumb}
              alt={embed.title || 'External Content'}
              className='rounded w-full'
            />
          )}
          <p className='mt-2 text-gray-800 font-bold'>{embed.title}</p>
        </a>
      );

    default:
      return <div className='text-gray-500'>Unsupported Embed Type</div>;
  }
};

// Main Post Component
export const Post = ({ post }: { post: PostView }) => (
  <article className='bg-theme-background border border-theme-btn-secondary shadow-sm p-4 w-full mx-auto max-w-screen-md rounded-lg'>
    <PostContent post={post} />
  </article>
);
