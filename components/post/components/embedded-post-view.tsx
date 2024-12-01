import { AppBskyEmbedRecord } from '@atproto/api';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { PostHeader } from './post-header';
import { PostText } from './post-text';
import { EmbedRenderer } from './embed-renderer';

export const EmbeddedPostView = ({
  embed,
}: {
  embed: AppBskyEmbedRecord.View;
}) => {
  const record = embed.record;

  if (!record) return null;

  const text = (record.value as { text?: string }).text || '';
  const author = record.author as ProfileViewBasic;
  const nestedEmbed = (record as { embed?: AppBskyEmbedRecord.View }).embed;

  return (
    <div className='m-4 p-2 border border-gray-800 rounded-md'>
      <PostHeader author={author} />
      {text && <PostText text={text} />}
      {nestedEmbed && <EmbedRenderer embed={nestedEmbed} />}
    </div>
  );
};
