import React from 'react';
import {
  ChatBubbleLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

import { PostType } from '@/types/post';
import cc from 'classcat';

export const Post = ({ post }: PostType) => {
  const {
    author,
    record,
    embed,
    replyCount,
    repostCount,
    likeCount,
    quoteCount,
  } = post;

  // Extract hashtags dynamically
  const hashtags = record.facets
    ?.map((facet) => facet.features.map((feature) => `#${feature.tag}`))
    .flat();

  return (
    <article
      className='bg-white border border-gray-300 rounded-md shadow-sm p-4 mb-4 max-w-screen-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto'
      role='article'
      aria-labelledby={`post-title-${post.cid}`}
    >
      {/* Author Information */}
      <header className='flex items-center mb-3'>
        <img
          src={author.avatar}
          alt={`Avatar of ${author.displayName}`}
          className='w-12 h-12 rounded-full mr-3'
        />
        <div>
          <p
            id={`post-title-${post.cid}`}
            className='text-base font-semibold text-gray-900'
          >
            {author.displayName}
          </p>
          <p className='text-sm text-gray-500'>
            <a href={`https://${author.handle}`} className='hover:underline'>
              @{author.handle}
            </a>
          </p>
        </div>
      </header>

      {/* Post Content */}
      <section>
        {/* Hashtags */}
        <p className='text-gray-700 break-words'>
          {record.text.split(' ').map((word, index) =>
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

        {/* Embedded Images */}
        {Array.isArray(embed?.images) &&
          embed.images.length > 0 &&
          embed.images[0]?.thumb && (
            <figure className='mt-3'>
              <img
                src={embed.images[0]?.thumb}
                alt={
                  embed.images[0]?.alt ||
                  `Image posted by ${author?.displayName || 'unknown author'}`
                }
                className={cc([
                  'w-full',
                  'rounded-md',
                  'object-cover',
                  'aspect-square',
                  // embed.images[0]?.aspectRatio
                  //   ? `aspect-[${embed.images[0]?.aspectRatio.width}/${embed.images[0]?.aspectRatio.height}]`
                  //   : 'aspect-square', // Default to square if aspect ratio is missing
                  'max-h-72', // Tailwind class for maxHeight: '300px'
                  //   {`aspect-[${embed.images[0]?.aspectRatio.width}/${embed.images[0]?.aspectRatio.height}]`: embed.images[0]?.aspectRatio,
                  // "aspect-square": !embed.images[0]?.aspectRatio}
                ])}
              />
              <figcaption className='sr-only'>
                {`Image posted by ${author?.displayName || 'unknown author'}`}
              </figcaption>
            </figure>
          )}
      </section>

      {/* Post Metadata */}
      <footer className='flex justify-between items-center mt-4 text-sm text-gray-500'>
        <span>
          Posted on: {new Date(record.createdAt).toLocaleDateString()}
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
