import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
} from '@atproto/api';
import { EmbeddedPostView } from './embedded-post-view';
import { EmbedVideoView } from './embed-video-view';
import { PostImages } from './post-images';
import { EmbedExternal } from './embed-external';

export const EmbedRenderer = ({
  embed,
}: {
  embed?:
    | AppBskyEmbedVideo.View
    | AppBskyEmbedExternal.View
    | AppBskyEmbedRecord.View
    | AppBskyEmbedRecord.View
    | AppBskyEmbedRecordWithMedia.View
    | AppBskyEmbedImages.View;
}) => {
  if (!embed) return null;

  switch (embed.$type) {
    case 'app.bsky.embed.external#view':
      return <EmbedExternal embed={embed as AppBskyEmbedExternal.View} />;

    case 'app.bsky.embed.record#view':
      return <EmbeddedPostView embed={embed as AppBskyEmbedRecord.View} />;

    case 'app.bsky.embed.recordWithMedia#view':
      const recordWithMedia = embed as AppBskyEmbedRecordWithMedia.View;
      return (
        <div className='mt-4'>
          {recordWithMedia.media && (
            <EmbedRenderer
              embed={
                recordWithMedia.media as
                  | AppBskyEmbedVideo.View
                  | AppBskyEmbedExternal.View
                  | AppBskyEmbedRecord.View
                  | AppBskyEmbedRecord.View
                  | AppBskyEmbedRecordWithMedia.View
              }
            />
          )}
          {recordWithMedia.record && (
            <EmbeddedPostView
              embed={recordWithMedia.record as AppBskyEmbedRecord.View}
            />
          )}
        </div>
      );

    case 'app.bsky.embed.video#view':
      return <EmbedVideoView embed={embed as AppBskyEmbedVideo.View} />;

    case 'app.bsky.embed.images#view':
      return <PostImages images={(embed as AppBskyEmbedImages.View).images} />;

    default:
      console.warn('Unsupported embed type:', embed.$type);
      return null;
  }
};
