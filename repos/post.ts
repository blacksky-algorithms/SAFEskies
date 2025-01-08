import { AtprotoAgent } from '@/repos/atproto-agent';

export const getPostThread = async (uri: string) => {
  try {
    const response = await AtprotoAgent.app.bsky.feed.getPostThread({
      uri,
    });

    return response;
  } catch (error) {
    console.error('Error fetching post thread:', error);
    return null;
  }
};
