import React from 'react';
import {
  ChatBubbleLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
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
      className='bg-white border border-gray-300 rounded-md shadow-sm p-4 mb-4 mx-auto w-full'
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
          <span
            className='flex items-center space-x-1'
            aria-label={`${replyCount} replies`}
          >
            <ChatBubbleLeftIcon className='h-5 w-5 text-gray-500' />
            <span>{replyCount}</span>
          </span>
          <span
            className='flex items-center space-x-1'
            aria-label={`${repostCount} reposts`}
          >
            <ArrowPathRoundedSquareIcon className='h-5 w-5 text-gray-500' />
            <span>{repostCount}</span>
          </span>
          <span
            className='flex items-center space-x-1'
            aria-label={`${likeCount} likes`}
          >
            <HeartIcon className='h-5 w-5 text-gray-500' />
            <span>{likeCount}</span>
          </span>
          <span
            className='flex items-center space-x-1'
            aria-label={`${quoteCount} quotes`}
          >
            <LinkIcon className='h-5 w-5 text-gray-500' />
            <span>{quoteCount}</span>
          </span>
        </div>
      </footer>
    </article>
  );
};

// Embed Component
export const EmbedComponent = ({ embed }: { embed: EmbedType }) => {
  console.log('EmbedComponent', { embed });
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
  console.log('VideoEmbedComponent', embed);
  const { playlist, thumbnail } = embed;

  return (
    <div className='mt-4 border border-gray-300 rounded-md overflow-hidden'>
      <div className='aspect-w-16 aspect-h-9'>
        <video
          controls
          poster={thumbnail}
          className='w-full h-full object-contain rounded-md'
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
  return (
    <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {embed.map((image, index) => (
        <a
          key={index}
          href={image.fullsize}
          target='_blank'
          rel='noopener noreferrer'
          className='block'
        >
          <img
            src={image.thumb}
            alt={image.alt || 'Embedded image'}
            className='w-full h-auto max-h-64 sm:max-h-80 lg:max-h-none rounded-md object-cover'
          />
        </a>
      ))}
    </div>
  );
};
