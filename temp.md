fetching post

```typescript
import { useEffect } from 'react';
import { preferredLanguages } from '@/utils/todo';
import { AtpAgent } from '@atproto/api';

export const agent = new AtpAgent({
  // "at://did:plc:qzkrgc4ahglknwb7ymee4a6w/app.bsky.feed.generator/aaafstml2groe"
  // App View URL
  service: 'https://api.bsky.app',
  // If you were making an authenticated client, you would
  // use the PDS URL here instead - the main one is bsky.social
  // service: "https://bsky.social",
});

useEffect(() => {
  const getFeed = async () => {
    try {
      const { data } = await agent.app.bsky.feed.getFeed(
        {
          feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
          limit: 30,
        },
        {
          headers: {
            'Accept-Language': preferredLanguages,
          },
        }
      );
      const { feed } = data;
      // FeedListProps[]
      setPosts(feed);
    } catch (error) {
      console.error({ error });
      // TODO: Handle error
    }
  };
  getFeed();
}, []);
```
