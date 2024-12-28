// pages/feeds.tsx
import { Feed } from '@/components/feed/feed';
import { Tabs } from '@/components/tab/tab';
import { ProfileManager } from '@/services/profile-manager';
import { FeedManager } from '@/services/feed-manager';
import cc from 'classcat';
import { UserRole } from '@/types/user';

export default async function FeedsPage() {
  const profile = await ProfileManager.getProfile();

  const { feeds, defaultFeed } = await FeedManager.getUserFeeds(profile?.did);

  // Now feeds include type information (admin/mod/created/subscribed)
  const allFeeds = feeds.length > 0 ? feeds : [defaultFeed];

  const tabs = allFeeds.map((feed) => {
    const styles = getFeedTypeBadgeStyles(feed?.type);
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
                [styles]: !!feed.type,
                hidden: !feed?.type,
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

function getFeedTypeBadgeStyles(type: UserRole) {
  switch (type) {
    case 'admin':
      return 'bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs';
    case 'mod':
      return 'bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs';
    default:
      return '';
  }
}
