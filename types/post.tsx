import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export interface PostType {
  post: {
    uri: string;
    cid: string;
    author: {
      did: string;
      handle: string;
      displayName?: string | undefined;
      avatar?: string | undefined;
      createdAt?: string | undefined;
    };
    record: {
      createdAt: string;
      text: string;
      facets: {
        features: {
          tag: string;
        }[];
        index: { byteStart: number; byteEnd: number };
      }[];
    };
    embed?: {
      images?: {
        thumb: string;
        fullsize: string;
        alt: string;
        aspectRatio: { height: number; width: number };
      }[];
    };
    replyCount: number;
    repostCount: number;
    likeCount: number;
    quoteCount: number;
    indexedAt: string;
  };
}
