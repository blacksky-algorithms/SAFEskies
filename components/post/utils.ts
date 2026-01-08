import { AtUri } from '@atproto/api';

export const getRkey = ({ uri }: { uri: string }): string => {
  const at = new AtUri(uri);
  return at.rkey;
};

export const toNiceDomain = (url: string): string => {
  try {
    const urlp = new URL(url);
    return urlp.host ? urlp.host : url;
  } catch {
    return url;
  }
};

export const getPostUrl = (atUri: string): string => {
  const at = new AtUri(atUri);
  return `https://blacksky.community/profile/${at.host}/post/${at.rkey}`;
};
