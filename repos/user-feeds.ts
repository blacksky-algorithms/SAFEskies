import { getActorFeeds } from '@/repos/actor';
import { getUserProfile } from './user';

const defaultFeed = {
  uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
  displayName: "What's Hot",
};

export async function getUserFeeds() {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      return { userFeeds: [], defaultFeed };
    }

    const userDid = profile.did;
    const feedsResponse = await getActorFeeds(userDid);

    const userFeeds =
      feedsResponse?.feeds?.map((feed) => ({
        did: feed.did,
        feedName: feed.uri.split('/').pop() || '',
        uri: feed.uri,
        displayName: feed.displayName,
      })) || [];

    return { userFeeds, defaultFeed };
  } catch (error) {
    console.error('Error fetching user feeds:', error);
    return { userFeeds: [], defaultFeed };
  }
}
