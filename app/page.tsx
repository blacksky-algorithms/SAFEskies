import { Tabs } from '@/components/tab/tab';
import { getUserFeeds } from '@/repos/user-feeds';

export default async function Page() {
  const { userFeeds, defaultFeed } = await getUserFeeds();

  const allFeeds = userFeeds.length > 0 ? userFeeds : [defaultFeed];

  const tabs = allFeeds.map((feed) => ({
    uri: feed.uri,
    displayName: feed.displayName,
  }));

  return (
    <div className='container mx-auto p-4'>
      <Tabs tabs={tabs} />
    </div>
  );
}
