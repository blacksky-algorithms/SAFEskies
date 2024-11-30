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
import * as HeroIcons from '@heroicons/react/24/outline';
import { Icon } from '@/components/icon';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

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
            href={(feature as AppBskyRichtextFacet.Link).uri || ''}
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
            <p className='text-sm '>@{author.handle}</p>
          </div>
        </div>
      )}
      {textRecord?.text &&
        renderLinks(textRecord.text, textRecord.facets || [])}
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
    case 'app.bsky.embed.images':
      console.log("switch case 'app.bsky.embed.images#view':", embed);
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
    case 'app.bsky.embed.external':
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

    // case 'app.bsky.embed.external':
    //   console.log('yererrppppppp: ', embed);
    //   return (
    //     <EmbedRecord embed={embed.external as AppBskyEmbedExternal.View} />
    //   );

    case 'app.bsky.embed.record#view':
    case 'app.bsky.embed.recordWithMedia#view':
      return (
        <EmbedRecord
          embed={
            embed as AppBskyEmbedRecord.View | AppBskyEmbedRecordWithMedia.View
          }
        />
      );

    default:
      return (
        <div className='text-gray-500'>
          Unsupported Embed Type {embed.$type || embed?.external?.$type}
        </div>
      );
  }
};

// Main Post Component
export const Post = ({ post }: { post: PostView }) => (
  <article className='bg-theme-background border border-theme-btn-secondary shadow-sm p-4 w-full mx-auto max-w-screen-md rounded-lg'>
    <PostContent post={post} />
    <PostFooter {...post} />
  </article>
);
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
    <Icon icon={icon} className='h-5 w-5 text-theme-btn-primary' />
    <span>{count}</span>
  </div>
);

const PostFooter = (postRecord: PostView) => {
  return (
    <footer className='flex justify-between items-center mt-4 text-sm text-theme-btn-text'>
      <span>
        Posted on:{' '}
        {new Date(postRecord.indexedAt as string | number).toLocaleDateString()}
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
const renderImageEmbed = (embed: AppBskyEmbedImages.View) => {
  if (!embed.images || embed.images.length === 0) {
    return <div className='text-gray-500'>No images available</div>;
  }

  return (
    <div className='mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
      {embed.images.map((image, index) => {
        const imageUrl = image.image?.ref?.$link;
        const aspectRatio = image.aspectRatio
          ? `${(image.aspectRatio.height / image.aspectRatio.width) * 100}%`
          : '100%';

        if (!imageUrl) {
          console.warn(`Image URL missing for index ${index}`, image);
          return null;
        }

        return (
          <div
            key={index}
            className='relative w-full'
            style={{
              paddingBottom: aspectRatio,
            }}
          >
            <OptimizedImage
              src={imageUrl}
              alt={image.alt || 'Image'}
              className='absolute top-0 left-0 w-full h-full object-cover rounded-md'
            />
          </div>
        );
      })}
    </div>
  );
};
export const EmbedRecord = ({
  embed,
}: {
  embed: AppBskyEmbedRecord.View | AppBskyEmbedRecordWithMedia.View;
}) => {
  if (!embed || !embed.record) {
    return <div>Unsupported Embedded Record</div>;
  }

  console.log('EmbedRecord', { embed });
  const recordData =
    embed.$type === 'app.bsky.embed.recordWithMedia#view'
      ? (embed as AppBskyEmbedRecordWithMedia.View).record
      : embed.record;

  if (recordData.$type !== 'app.bsky.embed.record#viewRecord') {
    return <div>Unsupported Record Type</div>;
  }

  const { value } = recordData as { value: { text?: string; type: any } };

  // Handle media embeds if they exist
  const mediaEmbed = true;
  console.log({ recordData, mediaEmbed });

  return (
    <div className='m-4'>
      {/* Render text or linked content */}
      {value.$type === 'app.bsky.feed.post' && (
        <PostContent
          post={{
            author: recordData.author as ProfileViewBasic,
            record: { text: value.text, facets: value.facets },
            embed: recordData.value.embed,
            embeds: recordData.embeds,
            // record: value,
            // embed: embeds,
            // uri: recordData.uri as string,
            // cid: recordData.cid as string,
            // author: recordData.author as ProfileViewBasic,
            // indexedAt: recordData.indexedAt as string,
          }}
        />
      )}

      {/* {value.$type === 'app.bsky.feed.post' && <div>RENDER POST HERE)</div>} */}

      {/* Render any additional embeds (e.g., media) */}
      {mediaEmbed && (
        <EmbedRenderer
          embed={
            mediaEmbed as
              | AppBskyEmbedImages.View
              | AppBskyEmbedVideo.View
              | AppBskyEmbedExternal.View
              | AppBskyEmbedRecord.View
          }
        />
      )}
    </div>
  );
};
