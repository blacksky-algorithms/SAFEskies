import React from 'react';
import {
  ChatBubbleLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import cc from 'classcat';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

// Define the structure of the record
interface PostRecord {
  $type: string;
  createdAt: string;
  text: string;
  facets?: {
    features: {
      $type: string;
      tag?: string;
    }[];
  }[];
}

// Define the structure of the external embed
interface ExternalEmbed {
  uri: string;
  thumb?: string;
  title: string;
  description?: string;
}

export const Post = ({ post }: { post: PostView }) => {
  const {
    author,
    record,
    embed,
    replyCount,
    repostCount,
    likeCount,
    quoteCount,
  } = post;

  // Assert that `record` is of type `PostRecord`
  const postRecord = record as PostRecord;

  // Assert that `embed.external` is of type `ExternalEmbed`
  const externalEmbed = embed?.external as ExternalEmbed | undefined;

  // Extract hashtags dynamically
  const hashtags = postRecord.facets?.flatMap((facet) =>
    facet.features.map((feature) => `#${feature.tag}`)
  );

  // Render embedded external links (GIFs or URLs)
  const renderExternalEmbed = () => {
    if (externalEmbed) {
      const { uri, thumb, title, description } = externalEmbed;
      return (
        <div className='mt-4 border border-gray-300 rounded-md overflow-hidden'>
          <a href={uri} target='_blank' rel='noopener noreferrer'>
            {thumb && (
              <img
                src={thumb}
                alt={description || 'External content'}
                className='w-full h-auto object-cover'
              />
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
    }
    return null;
  };

  return (
    <article
      className='bg-white border border-gray-300 rounded-md shadow-sm p-4 mb-4 mx-auto w-full'
      role='article'
      aria-labelledby={`post-title-${post.cid}`}
    >
      {/* Author Information */}
      <header className='flex items-center mb-3'>
        {author.avatar && (
          <img
            src={author.avatar}
            alt={`Avatar of ${author.displayName || author.handle}`}
            className='w-12 h-12 rounded-full mr-3'
          />
        )}
        <div>
          <p
            id={`post-title-${post.cid}`}
            className='text-base font-semibold text-gray-900'
          >
            {author.displayName || author.handle}
          </p>
          <p className='text-sm text-gray-500'>@{author.handle}</p>
        </div>
      </header>

      {/* Post Content */}
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
        {renderExternalEmbed()}
      </section>

      {/* Post Metadata */}
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
