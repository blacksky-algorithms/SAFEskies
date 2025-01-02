import { Feed } from '@/components/feed/feed';
import { Tabs } from '@/components/tab/tab';
import { ProfileManager } from '@/services/profile-manager';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';
import cc from 'classcat';

export default async function Page() {
  const profile = await ProfileManager.getProfile();

  const { feeds, defaultFeed } = await FeedPermissionManager.getUserFeeds(
    profile?.did
  );

  const allFeeds = feeds.length > 0 ? feeds : [defaultFeed];

  const tabs = allFeeds.map((feed) => {
    return {
      title: (
        <div
          className={cc([
            'flex items-center gap-2',
            { 'justify-center ': allFeeds.length === 1 },
          ])}
        >
          <span>{feed.displayName}</span>
          <span
            className={cc([
              '',
              {
                'bg-app-primary rounded-full px-2 py-1 text-xs':
                  !!feed.type && feed.type !== 'user',
                hidden: !feed?.type || feed.type === 'user',
              },
            ])}
          >
            {feed.type}
          </span>
        </div>
      ),
      TabContent: <Feed uri={feed.uri} key={feed.uri} />,
    };
  });

  return (
    <div className='container mx-auto p-4'>
      <Tabs tabs={tabs} />
    </div>
  );
}
