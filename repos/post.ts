import { AtprotoAgent } from '@/repos/atproto-agent';
import { isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export const getPostThread = async (uri: string) => {
  try {
    const response = await AtprotoAgent.app.bsky.feed.getPostThread({
      uri,
    });

    if (isThreadViewPost(response.data.thread)) {
      return response.data.thread;
    }
    return null;
  } catch (error) {
    console.error('Error fetching post thread:', error);
    return null;
  }
};
