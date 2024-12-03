import { AtUri } from '@atproto/api';

export const getRkey = ({ uri }: { uri: string }): string => {
  const at = new AtUri(uri);
  return at.rkey;
};

export const toNiceDomain = (url: string): string => {
  try {
    const urlp = new URL(url);
    return urlp.host ? urlp.host : url;
  } catch (e) {
    return url;
  }
};
