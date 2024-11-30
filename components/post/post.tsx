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
import * as HeroIcons from '@heroicons/react/24/outline';
import { Icon } from '@/components/icon';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

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
  console.log('PostContent:', post);
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
          <span key={`hashtag-${idx}`} className='text-blue-600'>
            #{text.slice(byteStart, byteEnd)}
          </span>
        );
      }

      if (feature.$type === 'app.bsky.richtext.facet#mention') {
        elements.push(
          <span key={`mention-${idx}`} className='text-blue-600'>
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

    return <p className='p-4'>{elements}</p>;
  };
  if (embed) {
    console.log('Embed:', embed);
  }
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
    console.log({ data });
    const record = data.embed.record; // Extracting main record

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
        embed: record.value.embed || null, // Support embedded media or nested content
      },
      embed: data.embed.record.embeds?.[0]?.media || null, // If there's an outer embed, include it
      uri: record.uri,
      cid: record.cid,
      indexedAt: record.indexedAt,
      replyCount: record.replyCount || 0,
      repostCount: record.repostCount || 0,
      likeCount: record.likeCount || 0,
      quoteCount: record.quoteCount || 0,
      langs: record.value.langs || [],
      labels: record.labels || [],
    };
  };

  // Usage Example
  const reshapedData = reshapeToPostContent(embed);

  console.log('EmbeddedPost:', embed);
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
  console.log('EmbedRecord:', embed);
  if (!embed.record) {
    console.warn('NO RECORD FOUND:', { embed });
    return <div>Content unavailable</div>;
  }

  const recordData = embed.record;

  // Handle nested embed and media cases
  const { value } = recordData as {
    value: TextRecord & { embed?: any };
  };

  const media =
    (embed as AppBskyEmbedRecordWithMedia.View).media ?? value.embed; // Prefer media, fallback to value.embed

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
const renderImages = (images: AppBskyEmbedImages['images']) => (
  <div className='mt-4 grid gap-2 grid-cols-2'>
    {images.map((image, index) => (
      <OptimizedImage
        key={index}
        src={image.ref?.$link || ''}
        alt={image.alt || 'Image'}
        className='rounded-md object-cover w-full'
      />
    ))}
  </div>
);

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
          {embed.images.map((image, index) => (
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
      console.log('app.bsky.embed.images', embed);
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    case 'app.bsky.embed.video#view':
      return (
        <div className='relative mt-4'>
          <video
            autoPlay
            loop
            muted
            controls
            poster={embed.thumbnail}
            className='object-cover w-full rounded-md'
          >
            <source src={embed.playlist} type='application/x-mpegURL' />
          </video>
        </div>
      );

    case 'app.bsky.embed.video':
      console.log('app.bsky.embed.video', embed);
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    case 'app.bsky.embed.external#view':
      return (
        <a
          href={embed.external.uri}
          target='_blank'
          rel='noopener noreferrer'
          className='block mt-4 shadow-md hover:shadow-lg transition-shadow'
        >
          {embed.external.thumb && (
            <OptimizedImage
              src={embed.external.thumb}
              alt={embed.external.title || 'External Content'}
              className='rounded w-full'
            />
          )}
          <p className='mt-2 font-bold'>{embed.external.title}</p>
          <p>{embed.external.description}</p>
        </a>
      );

    case 'app.bsky.embed.external':
      console.log('app.bsky.embed.external', embed);
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    case 'app.bsky.embed.recordWithMedia#view':
      return (
        <div>
          {/* Render media and record components */}
          <EmbedRenderer embed={embed.media as any} />
          <EmbedRecord embed={embed.record as any} />
        </div>
      );

    case 'app.bsky.embed.recordWithMedia':
      console.log('app.bsky.embed.recordWithMedia', embed);
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    case 'app.bsky.embed.record#view':
      if (embed?.record?.value?.$type === 'app.bsky.feed.post') {
        return <EmbeddedPost embed={embed} />;
      }
      return <EmbedRecord embed={embed} />;

    case 'app.bsky.embed.record':
      console.log('app.bsky.embed.record', embed);
      return (
        <div className='mt-4 bg-pink-400'>
          <p>Unsupported content type: {embed.$type}</p>
        </div>
      );

    default:
      console.warn('Unsupported content type:', { embed });
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

// Post Footer Component
const PostFooter = (postRecord: PostView) => {
  return (
    <footer className='flex p-4 justify-between items-center text-sm'>
      <span>
        Posted on: {new Date(postRecord.indexedAt).toLocaleDateString()}
      </span>
      <div className='flex items-center space-x-4'>
        <PostFooterIcon
          icon='ChatBubbleLeftIcon'
          count={postRecord.replyCount || 0}
          label='replies'
        />
        <PostFooterIcon
          icon='ArrowPathRoundedSquareIcon'
          count={postRecord.repostCount || 0}
          label='reposts'
        />
        <PostFooterIcon
          icon='HeartIcon'
          count={postRecord.likeCount || 0}
          label='likes'
        />
        <PostFooterIcon
          icon='LinkIcon'
          count={postRecord.quoteCount || 0}
          label='quotes'
        />
      </div>
    </footer>
  );
};

// Post Footer Icon Component
export const PostFooterIcon = ({
  icon,
  count,
  label,
}: {
  icon: keyof typeof HeroIcons;
  count: number;
  label: string;
}) => (
  <div className='flex items-center space-x-1'>
    <Icon icon={icon} className='h-5 w-5 text-theme-btn-primary' />
    <span>{count}</span>
  </div>
);
