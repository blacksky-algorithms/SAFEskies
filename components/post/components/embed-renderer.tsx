import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyGraphDefs,
  AppBskyLabelerDefs,
} from '@atproto/api';
import { useMemo } from 'react';

import { PostHeader } from '@/components/post/components/post-header';
import { PostImages } from '@/components/post/components/post-images';
import { EmbedVideoView } from '@/components/post/components/embed-video-view';
import { EmbedExternal } from '@/components/post/components/embed-external';
import { Info } from './embed-info';
import { GenericWithImageEmbed } from './embed-generic-with-image';
import { getRkey } from '../utils';
import { StarterPackEmbed } from './embed-starter-pack';
import { PostText } from './post-text';
import { CONTENT_LABELS } from '@/lib/constants';

const labelsToInfo = (
  labels?: AppBskyFeedDefs.PostView['labels']
): string | undefined => {
  const label = labels?.find((label) => CONTENT_LABELS.includes(label.val));

  switch (label?.val) {
    case 'porn':
    case 'sexual':
      return 'Adult Content';
    case 'nudity':
      return 'Non-sexual Nudity';
    case 'graphic-media':
      return 'Graphic Media';
    default:
      return undefined;
  }
};

export const EmbedRenderer = ({
  content,
  labels,
  hideRecord,
}: {
  content: AppBskyFeedDefs.PostView['embed'];
  labels: AppBskyFeedDefs.PostView['labels'];
  hideRecord?: boolean;
}) => {
  const labelInfo = useMemo(() => labelsToInfo(labels), [labels]);

  if (!content) return null;

  // this logic is pulled straight from blue sky. I thought it was important as I learn to understand how to handle different types of embeds and content types are handled I don't stray from the wisdom of experience
  try {
    if (AppBskyEmbedImages.isView(content)) {
      return <PostImages content={content} labelInfo={labelInfo} />;
    }

    if (AppBskyEmbedExternal.isView(content)) {
      return <EmbedExternal content={content} labelInfo={labelInfo} />;
    }

    if (AppBskyEmbedRecord.isView(content)) {
      if (hideRecord) {
        return null;
      }

      const record = content.record;

      if (AppBskyEmbedRecord.isViewRecord(record)) {
        const pwiOptOut = !!record.author.labels?.find(
          (label) => label.val === '!no-unauthenticated'
        );
        if (pwiOptOut) {
          // TODO: talk to Rudy about how to handle this
          return (
            <Info>
              The author of the quoted post has requested their posts not be
              displayed on external sites.
            </Info>
          );
        }

        let text;
        let facets;
        if (AppBskyFeedPost.isRecord(record.value)) {
          text = record.value.text;
          facets = record.value.facets;
        }

        const isAuthorLabeled = record.author.labels?.some((label) =>
          CONTENT_LABELS.includes(label.val)
        );

        return (
          <div className='transition-colors border-gray-800 rounded-lg p-4 gap-1.5 w-full flex flex-col'>
            <PostHeader
              author={record.author}
              isAuthorLabeled={isAuthorLabeled}
            />
            <PostText text={text} facets={facets} />
            {record.embeds?.map((embed) => (
              <EmbedRenderer
                key={embed.$type as string}
                content={embed}
                labels={record.labels}
                hideRecord
              />
            ))}
          </div>
        );
      }

      if (AppBskyGraphDefs.isListView(record)) {
        return (
          <GenericWithImageEmbed
            image={record.avatar}
            title={record.name}
            href={`/profile/${record.creator.did}/lists/${getRkey(record)}`}
            subtitle={
              record.purpose === AppBskyGraphDefs.MODLIST
                ? `Moderation list by @${record.creator.handle}`
                : `User list by @${record.creator.handle}`
            }
            description={record.description}
          />
        );
      }

      if (AppBskyFeedDefs.isGeneratorView(record)) {
        return (
          <GenericWithImageEmbed
            image={record.avatar}
            title={record.displayName}
            href={`/profile/${record.creator.did}/feed/${getRkey(record)}`}
            subtitle={`Feed by @${record.creator.handle}`}
            description={`Liked by ${record.likeCount ?? 0} users`}
          />
        );
      }

      if (AppBskyLabelerDefs.isLabelerView(record)) {
        // TODO: run some experiments to see what this is
        return null;
      }

      if (AppBskyGraphDefs.isStarterPackViewBasic(record)) {
        return <StarterPackEmbed content={record} />;
      }

      if (AppBskyEmbedRecord.isViewNotFound(record)) {
        return <Info>Quoted post not found, it may have been deleted.</Info>;
      }

      if (AppBskyEmbedRecord.isViewBlocked(record)) {
        return <Info>The quoted post is blocked.</Info>;
      }

      if (AppBskyEmbedRecord.isViewDetached(record)) {
        return null;
      }

      // Unknown embed type
      return null;
    }

    if (AppBskyEmbedVideo.isView(content)) {
      return <EmbedVideoView embed={content} labelInfo={labelInfo} />;
    }

    if (
      AppBskyEmbedRecordWithMedia.isView(content) &&
      AppBskyEmbedRecord.isViewRecord(content.record.record)
    ) {
      return (
        <div className='flex flex-col gap-2'>
          <EmbedRenderer
            content={content.media}
            labels={labels}
            hideRecord={hideRecord}
          />
          <EmbedRenderer
            content={{
              $type: 'app.bsky.embed.record#view',
              record: content.record.record,
            }}
            labels={content.record.record.labels}
            hideRecord={hideRecord}
          />
        </div>
      );
    }

    // Unknown embed type
    return null;
  } catch (err) {
    return (
      <Info>{err instanceof Error ? err.message : 'An error occurred'}</Info>
    );
  }
};
