import { AtprotoAgent } from '@/repos/atproto-agent';

export const getActorFeeds = async (actor: string) => {
  try {
    const response = await AtprotoAgent.app.bsky.feed.getActorFeeds({
      actor,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching feed generator data:', error);
    throw new Error('Failed to fetch feed generator data.');
  }
};
