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
const reshapeToPostContent = (data: EmbedType) => {
  if (!data || typeof data.embed !== 'object' || data.embed === null) return;
  const record = (data.embed as any).record as {
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
    embed: 'embed' in data.embed ? (data.embed as any).embed : null,
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
// Post Content Component
export const PostContent = ({
  post,
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
            {text.slice(byteStart, byteEnd)}
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
    <div className={'p-3 shadow'}>
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

export const EmbeddedPost = ({ embed }: { embed: EmbedType }) => {
  if (!embed) return;

  const reshapedData = reshapeToPostContent(embed);

  return (
    <div className='p-3 shadow border border-gray-800'>
      {<PostContent post={reshapedData!} />}
    </div>
  );
};

// Embed Record Component
export const EmbedRecord = ({ embed }: { embed: EmbedType }) => {
  if (!embed.record || !embed) {
    console.warn('NO RECORD FOUND:', { embed });
    return <div>Content unavailable</div>;
  }

  const recordData = embed.record as {
    author: ProfileViewBasic;
    value: any;
    embeds: any;
    uri: string;
    cid: string;
    indexedAt: string;
  };

  // Handle nested embed and media cases
  const { value } = recordData as { value: any };

  const media =
    (embed as AppBskyEmbedRecordWithMedia.View).media ?? value?.embed;

  if (!media) {
    console.warn('No media or nested embed found:', {
      embed,
      media,
      recordData,
      text: value?.text,
    });
  }

  return (
    <div>
      {/* Render media if present */}
      {media && <EmbedRenderer embed={media as EmbedType} />}
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
export const EmbedRenderer = ({ embed }: { embed: EmbedType }) => {
  switch (embed.$type) {
    case 'app.bsky.embed.images#view':
    case 'app.bsky.embed.images':
      return (
        <div className='mt-4 grid gap-2 grid-cols-2'>
          {(embed as AppBskyEmbedImages.View).images.map((image, index) => (
            <OptimizedImage
              key={index}
              src={image.fullsize || image.thumb}
              alt={image.alt || 'Image'}
              className='rounded-md object-cover w-full max-w-full'
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

    case 'app.bsky.embed.video':
      return (
        <div className='mt-4'>
          <p>
            Unsupported content type: {embed.$type} {JSON.stringify(embed)}
          </p>
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
          className='block mt-4 p-3 border border-gray-800 rounded-md shadow-md hover:shadow-lg transition-shadow'
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
          <EmbedRenderer embed={embed} />
          {/* <EmbedRecord embed={embed.record} /> */}

          <EmbedRecord embed={embed} />
        </div>
      );

    case 'app.bsky.embed.recordWithMedia':
      return <EmbedRecord embed={embed} />;

    case 'app.bsky.embed.record#view':
      if ((embed.record as any)?.value?.$type === 'app.bsky.feed.post') {
        return <EmbeddedPost embed={embed} />;
      }
      return <EmbedRecord embed={embed} />;

    case 'app.bsky.embed.record':
      return <EmbedRecord embed={embed} />;

    default:
      debugger;
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
