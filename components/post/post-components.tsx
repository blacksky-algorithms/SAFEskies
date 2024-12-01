import React from 'react';

import * as HeroIcons from '@heroicons/react/24/outline';
import { Icon } from '@/components/icon';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { OptimizedImage } from '../optimized-image';
import { AppBskyRichtextFacet } from '@atproto/api';
import cc from 'classcat';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';

// Post Footer Component
export const PostFooter = (postRecord: PostView) => {
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
const PostFooterIcon = ({
  icon,
  count,
  label,
}: {
  icon: keyof typeof HeroIcons;
  count: number;
  label: string;
}) => (
  <div className='flex items-center space-x-1'>
    <Icon
      aria-label={label}
      icon={icon}
      className='h-5 w-5 text-theme-btn-primary'
    />
    <span>{count}</span>
  </div>
);

export const PostHeader = ({
  author,
}: // labels,
{
  author: ProfileViewBasic;
  // labels: Labels[];
}) => {
  if (!author) return null;
  // TODO: Add labels to post header
  return (
    <div className='mb-2 flex items-center'>
      <OptimizedImage
        src={author?.avatar ?? undefined}
        alt={`Avatar of ${author.displayName || author.handle}`}
        className='w-8 h-8 rounded-full mr-2'
      />
      <div>
        <p className='font-semibold'>{author.displayName || author.handle}</p>
        <p className='text-sm'>@{author.handle}</p>
      </div>
      <div className='flex items-center space-x-2'></div>
    </div>
  );
};

interface TextRecord {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
}

const renderTextSegment = (
  text: string,
  start: number,
  end: number,
  key: string
) => <span key={key}>{text.slice(start, end)}</span>;

const renderFacet = (
  facet: AppBskyRichtextFacet.Main,
  text: string,
  idx: number
) => {
  const { byteStart, byteEnd } = facet.index;
  const feature = facet.features[0];
  const content = text.slice(byteStart, byteEnd);
  console.log({ feature });

  switch (feature.$type) {
    case 'app.bsky.richtext.facet#tag':
      return (
        <span key={`hashtag-${idx}`} className='text-theme-btn-primary '>
          #{content}
        </span>
      );
    case 'app.bsky.richtext.facet#mention':
      return (
        <span key={`mention-${idx}`} className='text-theme-btn-primary'>
          {content}
        </span>
      );
    case 'app.bsky.richtext.facet#link':
      return (
        <a
          key={`link-${idx}`}
          href={(feature as AppBskyRichtextFacet.Link).uri || undefined}
          target='_blank'
          rel='noopener noreferrer'
          className='text-theme-btn-primary underline'
        >
          {content}
        </a>
      );
    default:
      return null;
  }
};

export const PostText = ({
  text = '',
  facets = [],
}: {
  text?: string;
  facets?: AppBskyRichtextFacet.Main[];
}) => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  facets.forEach((facet, idx) => {
    const { byteStart } = facet.index;

    if (lastIndex < byteStart) {
      elements.push(
        renderTextSegment(text, lastIndex, byteStart, `text-${idx}`)
      );
    }

    elements.push(renderFacet(facet, text, idx));
    lastIndex = facet.index.byteEnd;
  });

  if (lastIndex < text.length) {
    elements.push(
      renderTextSegment(text, lastIndex, text.length, 'remaining-text')
    );
  }

  return <p className='p-4'>{elements}</p>;
};

export const PostImages = ({ images }: { images: ViewImage[] }) => {
  const imageCount = images.length;
  const getGridClass = () => {
    if (imageCount === 1) {
      return 'grid-cols-1';
    } else if (imageCount === 2) {
      return 'grid-cols-2';
    } else {
      return 'grid-cols-2 grid-rows-2';
    }
  };
  return (
    <div
      className={cc([
        `mt-4 grid gap-1 ${getGridClass()} max-w-[300px] mx-auto`,
        // { 'w-[400px]': imageCount === 1 },
      ])}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.fullsize || image.thumb}
          alt={image.alt || 'Image'}
          className={cc([
            'rounded-md object-contain',
            {
              'h-auto w-full': images.length <= 2,
              'h-theme-post-image-multi w-theme-post-image-multi':
                images.length >= 3,
            },
          ])}
        />
      ))}
    </div>
  );
};
