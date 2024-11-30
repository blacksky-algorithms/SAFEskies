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
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { PostFooter } from './post-footer';
import { Label } from '@atproto/api/dist/moderation/types';

interface TextRecord {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
}

// Post Content Component
export const PostContent = ({
  post,
  isEmbedded = false,
}: {
  post: PostView;
  isEmbedded?: boolean;
}) => {
  const { record, author, embed } = post;
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

      if (feature.$type === 'app.bsky.richtext.facet#tag') {
        elements.push(
          <span key={`hashtag-${idx}`} className='text-theme-btn-primary'>
            #{text.slice(byteStart, byteEnd)}
          </span>
        );
      }

      if (feature.$type === 'app.bsky.richtext.facet#mention') {
        elements.push(
          <span key={`mention-${idx}`} className='text-theme-btn-primary'>
            @{text.slice(byteStart, byteEnd)}
          </span>
        );
      }

      if (feature.$type === 'app.bsky.richtext.facet#link') {
        elements.push(
          <a
            key={`link-${idx}`}
            href={(feature as AppBskyRichtextFacet.Link).uri || undefined}
            target='_blank'
            rel='noopener noreferrer'
            className='text-theme-btn-primary underline'
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

    return <p className='p-4'>{elements}</p>;
  };

  return (
    <div className={`post-content p-3 shadow ${isEmbedded ? 'border' : ''}`}>
      {author && (
        <div className='author-info mb-2 flex items-center'>
          <OptimizedImage
            src={author?.avatar ?? undefined}
            alt={`Avatar of ${author.displayName || author.handle}`}
            className='w-8 h-8 rounded-full mr-2'
          />
          <div>
            <p className='font-semibold'>
              {author.displayName || author.handle}
            </p>
            <p className='text-sm'>@{author.handle}</p>
          </div>
        </div>
      )}
      {textRecord?.text &&
        renderLinks(textRecord.text, textRecord.facets || [])}

      {/* {embed.record.value.$type === 'app.bsky.feed.post' && (<div>)} */}
      {embed && (
        <EmbedRenderer
          embed={
            embed as
              | AppBskyEmbedImages.View
              | AppBskyEmbedVideo.View
              | AppBskyEmbedExternal.View
              | AppBskyEmbedRecord.View
              | AppBskyEmbedRecordWithMedia.View
          }
        />
      )}
    </div>
  );
};

export const EmbeddedPost = (
  embed:
    | AppBskyEmbedImages.View
    | AppBskyEmbedVideo.View
    | AppBskyEmbedExternal.View
    | AppBskyEmbedRecord.View
    | AppBskyEmbedRecordWithMedia.View
) => {
  if (!embed) return;
  const reshapeToPostContent = (
    data:
      | AppBskyEmbedImages.View
      | AppBskyEmbedVideo.View
      | AppBskyEmbedExternal.View
      | AppBskyEmbedRecord.View
      | AppBskyEmbedRecordWithMedia.View
  ) => {
    const record = data.embed.record as {
      author: any;
      value: any;
      embeds: any;
      uri: string;
      cid: string;
      indexedAt: string;
      replyCount: number;
      repostCount: number;
      likeCount: number;
      quoteCount: number;
      labels?: Label[];
    };

    return {
      author: {
        did: record.author.did,
        handle: record.author.handle,
        displayName: record.author.displayName,
        avatar: record.author.avatar,
        associated: record.author.associated,
        labels: record.author.labels,
        createdAt: record.author.createdAt,
      },
      record: {
        text: record.value.text,
        facets: record.value.facets,
        createdAt: record.value.createdAt,
        embed: record.value.embed || null,
      },
      embed: record.embeds?.[0]?.media || null,
      cid: record.cid,
      uri: record.uri,
      indexedAt: record.indexedAt,
      replyCount: record.replyCount || 0,
      repostCount: record.repostCount || 0,
      likeCount: record.likeCount || 0,
      quoteCount: record.quoteCount || 0,
      langs: record.value.langs || [],
      labels: record.labels || [],
    } satisfies PostView;
  };

  const reshapedData = reshapeToPostContent(embed);

  return (
    <div className='p-3 shadow border'>
      <PostContent post={reshapedData} />
    </div>
  );
};

// Embed Record Component
export const EmbedRecord = ({
  embed,
}: {
  embed: AppBskyEmbedRecord.View | AppBskyEmbedRecordWithMedia.View;
}) => {
  if (!embed.record || !embed) {
    console.warn('NO RECORD FOUND:', { embed });
    return <div>Content unavailable</div>;
  }

  const recordData = embed.record;

  // Handle nested embed and media cases
  const { value } = recordData;

  const media =
    (embed as AppBskyEmbedRecordWithMedia.View).media ?? value?.embed;

  if (!media) {
    console.warn('No media or nested embed found:', { embed });
  }

  return (
    <div>
      {/* Render media if present */}
      {media && <EmbedRenderer embed={media} />}
      {/* Render main post content */}
      <PostContent
        post={{
          author: recordData.author as ProfileViewBasic,
          record: value,
          embed: undefined, // Prevent circular embed rendering
          embeds: recordData.embeds,
          uri: recordData.uri as string,
          cid: recordData.cid as string,
          indexedAt: recordData.indexedAt as string,
        }}
        isEmbedded={true}
      />
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

    case 'app.bsky.embed.images':
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
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

    case 'app.bsky.embed.video':
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    case 'app.bsky.embed.external#view':
      //Todo: refine isGif check
      const isGif = (
        embed.external as AppBskyEmbedExternal.External
      ).uri.includes('.gif');

      return (
        <a
          href={
            isGif
              ? undefined
              : (embed.external as AppBskyEmbedExternal.External).uri ||
                undefined
          }
          target='_blank'
          rel='noopener noreferrer'
          className='block mt-4 p-3 border border-gray-300 rounded-md shadow-md hover:shadow-lg transition-shadow'
        >
          {(embed.external as AppBskyEmbedExternal.External).thumb && (
            <OptimizedImage
              src={
                isGif
                  ? (
                      embed?.external as AppBskyEmbedExternal.External
                    )?.uri?.toString()
                  : (
                      embed?.external as AppBskyEmbedExternal.External
                    )?.thumb?.toString() || undefined
              }
              alt={
                (embed.external as AppBskyEmbedExternal.External).title ||
                'External Content'
              }
              className='rounded w-full'
            />
          )}
          <p className='mt-2  font-bold'>
            {(embed.external as AppBskyEmbedExternal.External).title}
          </p>
        </a>
      );

    case 'app.bsky.embed.external':
      return <EmbedRecord embed={embed} />;

    case 'app.bsky.embed.recordWithMedia#view':
      return (
        <div>
          {/* Render media and record components */}
          <EmbedRenderer embed={embed.media as any} />
          <EmbedRecord embed={embed.record as any} />
        </div>
      );

    case 'app.bsky.embed.recordWithMedia':
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    case 'app.bsky.embed.record#view':
      if (embed?.record?.value?.$type === 'app.bsky.feed.post') {
        return <EmbeddedPost embed={embed as AppBskyEmbedRecord.View} />;
      }
      return <EmbedRecord embed={embed} />;

    case 'app.bsky.embed.record':
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    default:
      return (
        <div className='bg-pink-500'>
          Unsupported content type {embed?.$type}
        </div>
      );
  }
};

// Main Post Component
export const Post = ({ post }: { post: PostView }) => (
  <article className='bg-theme-background border shadow-sm w-full mx-auto max-w-screen'>
    <PostContent post={post} />
    <PostFooter {...post} />
  </article>
);
