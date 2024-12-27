import { Feed } from '@/components/feed/feed';
import { Tabs } from '@/components/tab/tab';
import { getUserFeeds } from '@/repos/user-feeds';

export default async function Page() {
  const { userFeeds, defaultFeed } = await getUserFeeds();

  const allFeeds = userFeeds.length > 0 ? userFeeds : [defaultFeed];

  const tabs = allFeeds.map((feed, index) => ({
    title: feed.displayName,
    TabContent: <Feed uri={feed.uri} key={feed.uri + index} />,
  }));

  return (
    <div className='container mx-auto p-4'>
      <Tabs tabs={tabs} />
    </div>
  );
}
