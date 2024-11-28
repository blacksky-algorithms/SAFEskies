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
  isVideoEmbed,
} from '@/types/guards';
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
          <div
            className='flex items-center space-x-1'
            aria-label={`${replyCount} replies`}
          >
            <Icon icon='ChatBubbleLeftIcon' className='h-5 w-5' />
            <span>{replyCount}</span>
          </div>
          <div
            className='flex items-center space-x-1'
            aria-label={`${repostCount} reposts`}
          >
            <Icon icon='ArrowPathRoundedSquareIcon' className='h-5 w-5' />
            <span>{repostCount}</span>
          </div>
          <div
            className='flex items-center space-x-1'
            aria-label={`${likeCount} likes`}
          >
            <Icon icon='HeartIcon' className='h-5 w-5' />
            <span>{likeCount}</span>
          </div>
          <div
            className='flex items-center space-x-1'
            aria-label={`${quoteCount} quotes`}
          >
            <Icon icon='LinkIcon' className='h-5 w-5' />
            <span>{quoteCount}</span>
          </div>
        </div>
      </footer>
    </article>
  );
};

// Embed Component
export const EmbedComponent = ({ embed }: { embed: EmbedType }) => {
  if (!embed) return null;

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

  return null;
};

// Record Embed Component
export const RecordEmbedComponent = ({ embed }: { embed: RecordEmbed }) => {
  const { author, value } = embed;

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

// External Embed Component (GIF Support)
export const ExternalEmbedComponent = ({ embed }: { embed: ExternalEmbed }) => {
  const { uri, thumb, title, description } = embed;

  const isGif = uri.toLowerCase().endsWith('.gif');

  return (
    <div className='mt-4 border border-gray-300 rounded-md overflow-hidden'>
      <a href={uri} target='_blank' rel='noopener noreferrer'>
        {isGif ? (
          <img
            src={uri}
            alt={description || 'External GIF'}
            className='w-full h-auto object-cover'
          />
        ) : (
          thumb && (
            <img
              src={thumb}
              alt={description || 'External content'}
              className='w-full h-auto object-cover'
            />
          )
        )}
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

// Video Embed Component
export const VideoEmbedComponent = ({ embed }: { embed: VideoEmbed }) => {
  const { playlist, thumbnail } = embed;

  return (
    <div className='mt-4 border border-gray-300 rounded-md overflow-hidden'>
      <div className='relative w-full max-w-full aspect-video'>
        <video
          controls
          poster={thumbnail}
          className='absolute inset-0 w-full h-full object-contain max-w-full rounded-md'
        >
          <source src={playlist} type='application/x-mpegURL' />
          Your browser does not support the video tag.
        </video>
      </div>
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
          className='block w-full'
        >
          <img
            src={image.thumb}
            alt={image.alt || 'Embedded image'}
            className={cc([
              'rounded-md object-cover w-full',
              {
                'h-post-media-single': imagesToRender.length === 1,
                'h-post-media-multi': imagesToRender.length > 1,
              },
            ])}
          />
        </a>
      ))}
    </div>
  );
};
