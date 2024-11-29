/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Icon } from '@/components/icon';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import {
  EmbedType,
  ExternalEmbed,
  ImageEmbed,
  PostRecord,
  RecordEmbed,
  VideoEmbed,
} from '@/types/post';
import {
  isExternalEmbed,
  isImagesEmbed,
  isRecordEmbed,
  isRecordWithMediaEmbed,
  isVideoEmbed,
} from '@/types/guards';

import * as HeroIcons from '@heroicons/react/24/outline';
import cc from 'classcat';

// Main Post Component
export const Post = ({ post }: { post: PostView }) => {
  const {
    author,
    record,
    embed,
    replyCount = 0,
    repostCount = 0,
    likeCount = 0,
    quoteCount = 0,
  } = post;

  const postRecord = record as PostRecord;

  if (!postRecord) {
    console.warn('Missing post record:', post);
    return null;
  }

  const hashtags = postRecord.facets?.flatMap((facet) =>
    facet.features.map((feature) => `#${feature.tag}`)
  );

  return (
    <article
      className={cc([
        'bg-white border border-gray-300 rounded-md shadow-sm p-4 w-full max-w-full mx-auto overflow-hidden',
      ])}
      role='article'
      aria-labelledby={`post-title-${post.cid}`}
    >
      <header className='flex items-center mb-3'>
        {author?.avatar && (
          <img
            src={author.avatar}
            alt={`Avatar of ${author?.displayName || author?.handle}`}
            className='w-12 h-12 rounded-full mr-3'
          />
        )}
        <div>
          <p
            id={`post-title-${post.cid}`}
            className='text-base font-semibold text-gray-900'
          >
            {author?.displayName || author?.handle}
          </p>
          <p className='text-sm text-gray-500'>@{author?.handle}</p>
        </div>
      </header>

      <section>
        <p className='text-gray-700 break-words'>
          {postRecord.text.split(' ').map((word, index) =>
            hashtags?.includes(word) ? (
              <span key={index} className='text-blue-500 break-words'>
                {word}
              </span>
            ) : (
              <span key={index} className='break-words'>
                {word}{' '}
              </span>
            )
          )}
        </p>
        {embed && <EmbedComponent embed={embed as EmbedType} />}
      </section>

      <footer className='flex justify-between items-center mt-4 text-sm text-gray-500'>
        <span>
          Posted on: {new Date(postRecord.createdAt).toLocaleDateString()}
        </span>
        <div className='flex items-center space-x-4'>
          <PostFooterIcon
            icon='ChatBubbleLeftIcon'
            count={replyCount}
            label='replies'
          />
          <PostFooterIcon
            icon='ArrowPathRoundedSquareIcon'
            count={repostCount}
            label='reposts'
          />
          <PostFooterIcon icon='HeartIcon' count={likeCount} label='likes' />
          <PostFooterIcon icon='LinkIcon' count={quoteCount} label='quotes' />
        </div>
      </footer>
    </article>
  );
};

// Record Embed Component
export const RecordEmbedComponent = ({ embed }: { embed: RecordEmbed }) => {
  const { author, value } = embed;

  if (!value) {
    console.warn('RecordEmbed has no value:', embed);
    return null;
  }

  return (
    <div className='mt-4 p-3 border border-gray-300 rounded-md bg-gray-100'>
      <header className='flex items-center mb-2'>
        {author?.avatar && (
          <img
            src={author.avatar}
            alt={`Avatar of ${author?.displayName || author?.handle}`}
            className='w-8 h-8 rounded-full mr-3'
          />
        )}
        <div>
          <p className='text-sm font-semibold text-gray-900'>
            {author?.displayName || author?.handle}
          </p>
          <p className='text-xs text-gray-500'>@{author?.handle}</p>
        </div>
      </header>

      <p className='text-gray-700'>{value?.text}</p>

      {value?.embed && <EmbedComponent embed={value.embed as EmbedType} />}
    </div>
  );
};

// Video Embed Component
export const VideoEmbedComponent = ({ embed }: { embed: VideoEmbed }) => {
  const { playlist, thumbnail, aspectRatio, mimeType, video } = embed;

  // Video source priority: HLS (playlist), fallback to linked video
  const videoSource = playlist || video?.ref?.$link;

  if (!videoSource) {
    console.warn('No video source available for embed:', embed);
    return null;
  }

  return (
    <div
      className='mt-4 border border-gray-300 rounded-md overflow-hidden'
      style={{
        aspectRatio: aspectRatio
          ? `${aspectRatio.width} / ${aspectRatio.height}`
          : undefined,
      }}
    >
      <video
        controls
        poster={thumbnail}
        className='w-full h-full object-cover rounded-md'
      >
        {mimeType && <source src={videoSource} type={mimeType} />}
        <source src={videoSource} type='video/mp4' />
        <source src={videoSource} type='application/x-mpegURL' />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// Image Embed Component
export const ImagesEmbedComponent = ({ embed }: { embed: ImageEmbed[] }) => {
  const imagesToRender = embed.slice(0, 4); // Limit to 4 images maximum

  return (
    <div
      className={cc([
        'mt-4 grid gap-2',
        {
          'grid-cols-1': imagesToRender.length === 1,
          'grid-cols-2': imagesToRender.length > 1,
        },
      ])}
    >
      {imagesToRender.map((image, index) => (
        <a
          key={index}
          href={image.fullsize}
          target='_blank'
          rel='noopener noreferrer'
          className='block relative w-full'
        >
          <img
            src={image.thumb}
            alt={image.alt || ''}
            className='object-cover w-full h-full rounded-md'
            style={{
              transitionDuration: '0ms',
              transitionTimingFunction: 'linear',
            }}
          />
        </a>
      ))}
    </div>
  );
};

// Embed Component
export const EmbedComponent = ({ embed }: { embed: EmbedType }) => {
  console.log('EmbedComponent:', { embed });

  if (!embed) {
    console.warn('Embed is null or undefined');
    return null;
  }

  if (isExternalEmbed(embed)) {
    return <ExternalEmbedComponent embed={embed.external} />;
  }

  if (isRecordEmbed(embed)) {
    return <RecordEmbedComponent embed={embed.record} />;
  }

  if (isImagesEmbed(embed)) {
    return <ImagesEmbedComponent embed={embed.images} />;
  }

  if (isVideoEmbed(embed)) {
    return <VideoEmbedComponent embed={embed.video ?? embed} />;
  }

  if (isRecordWithMediaEmbed(embed)) {
    const { record, media } = embed.recordWithMedia || {};

    if (!record && !media) {
      console.warn('recordWithMedia has neither record nor media:', embed);
      return (
        <div className='mt-4 p-4 border border-gray-300 rounded-md bg-gray-100'>
          <p className='text-sm text-gray-500'>
            No embedded content available.
          </p>
        </div>
      );
    }

    return (
      <div className='mt-4'>
        {record && (
          <div className='mb-4'>
            <RecordEmbedComponent embed={record} />
          </div>
        )}
        {media && <EmbedComponent embed={media} />}
      </div>
    );
  }

  console.warn('Unsupported embed type:', embed);
  return (
    <div className='mt-4 p-4 border border-gray-300 rounded-md bg-gray-100'>
      <p className='text-sm text-gray-500'>
        Unsupported embedded content type.
      </p>
    </div>
  );
};

// External Embed Component
export const ExternalEmbedComponent = ({ embed }: { embed: ExternalEmbed }) => {
  const { uri, thumb, title, description } = embed;

  if (!uri) {
    console.warn('Missing URI in ExternalEmbed', embed);
    return null;
  }

  const isGif =
    (typeof uri === 'string' && uri.toLowerCase().includes('.gif')) ||
    (typeof thumb === 'string' && thumb.toLowerCase().includes('.gif'));

  const renderMedia = () => {
    if (isGif) {
      return (
        <img
          src={uri}
          alt={description || 'External GIF'}
          className='w-full h-auto object-cover'
        />
      );
    }

    if (thumb) {
      return (
        <img
          src={thumb}
          alt={description || 'External content'}
          className='w-full h-auto object-cover'
        />
      );
    }

    return (
      <div className='w-full h-auto bg-gray-200 flex items-center justify-center'>
        <p className='text-sm text-gray-500'>No preview available</p>
      </div>
    );
  };

  return (
    <div className='mt-4 border border-gray-300 rounded-md overflow-hidden'>
      <a href={uri} target='_blank' rel='noopener noreferrer'>
        {renderMedia()}
        <div className='p-2'>
          <p className='font-bold text-gray-800'>{title}</p>
          {description && (
            <p className='text-sm text-gray-500'>{description}</p>
          )}
        </div>
      </a>
    </div>
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
  <div className='flex items-center space-x-1' aria-label={`${count} ${label}`}>
    <Icon icon={icon} className='h-5 w-5' />
    <span>{count}</span>
  </div>
);
