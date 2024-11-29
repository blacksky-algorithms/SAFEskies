export interface PostRecord {
  $type: string;
  createdAt: string;
  text: string;
  facets?: {
    features: {
      $type: string;
      tag?: string;
    }[];
  }[];
  embed?: EmbedType;
}

export interface ExternalEmbed {
  uri: string;
  thumb?: string;
  title: string;
  description?: string;
}

export interface RecordEmbed {
  $type: string;
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  value: PostRecord;
  replyCount?: number;
  repostCount?: number;
  quoteCount?: number;
}

export interface VideoEmbed {
  playlist?: string;
  thumbnail: string;
  aspectRatio: {
    height: number;
    width: number;
  };
  mimeType?: string;
  video?: {
    ref: {
      $link: string;
    };
  };
}

export interface RecordWithMediaEmbed {
  record: RecordEmbed;
  media: EmbedType; // Can be an image, video, or other embed type
}

export interface ImageEmbed {
  thumb: string;
  fullsize: string;
  alt: string;
  aspectRatio: {
    height: number;
    width: number;
  };
}

export type EmbedType =
  | { $type: 'app.bsky.embed.external'; external: ExternalEmbed }
  | { $type: 'app.bsky.embed.external#view'; external: ExternalEmbed }
  | { $type: 'app.bsky.embed.record'; record: RecordEmbed }
  | { $type: 'app.bsky.embed.record#view'; record: RecordEmbed }
  | { $type: 'app.bsky.embed.images'; images: ImageEmbed[] }
  | { $type: 'app.bsky.embed.images#view'; images: ImageEmbed[] }
  | { $type: 'app.bsky.embed.video'; video: VideoEmbed }
  | { $type: 'app.bsky.embed.video#view'; video: VideoEmbed }
  | {
      $type: 'app.bsky.embed.recordWithMedia';
      recordWithMedia: RecordWithMediaEmbed;
    }
  | {
      $type: 'app.bsky.embed.recordWithMedia#view';
      recordWithMedia: RecordWithMediaEmbed;
    };
