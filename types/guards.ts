import {
  EmbedType,
  RecordEmbed,
  ImageEmbed,
  ExternalEmbed,
  VideoEmbed,
  RecordWithMediaEmbed,
} from '@/types/post';

export const isExternalEmbed = (
  embed: EmbedType
): embed is {
  $type: 'app.bsky.embed.external' | 'app.bsky.embed.external#view';
  external: ExternalEmbed;
} => {
  return (
    embed.$type === 'app.bsky.embed.external' ||
    embed.$type === 'app.bsky.embed.external#view'
  );
};

export const isRecordEmbed = (
  embed: EmbedType
): embed is {
  $type: 'app.bsky.embed.record' | 'app.bsky.embed.record#view';
  record: RecordEmbed;
} => {
  return (
    embed.$type === 'app.bsky.embed.record' ||
    embed.$type === 'app.bsky.embed.record#view'
  );
};

export const isImagesEmbed = (
  embed: EmbedType
): embed is {
  $type: 'app.bsky.embed.images' | 'app.bsky.embed.images#view';
  images: ImageEmbed[];
} => {
  return (
    embed.$type === 'app.bsky.embed.images' ||
    embed.$type === 'app.bsky.embed.images#view'
  );
};

export const isVideoEmbed = (
  embed: EmbedType
): embed is {
  $type: 'app.bsky.embed.video' | 'app.bsky.embed.video#view';
  video: VideoEmbed;
} => {
  return (
    embed.$type === 'app.bsky.embed.video' ||
    embed.$type === 'app.bsky.embed.video#view'
  );
};

export const isRecordWithMediaEmbed = (
  embed: EmbedType
): embed is {
  $type:
    | 'app.bsky.embed.recordWithMedia'
    | 'app.bsky.embed.recordWithMedia#view';
  recordWithMedia: RecordWithMediaEmbed;
} => {
  return (
    embed.$type === 'app.bsky.embed.recordWithMedia' ||
    embed.$type === 'app.bsky.embed.recordWithMedia#view'
  );
};
