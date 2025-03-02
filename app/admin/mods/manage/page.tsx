import { ModManagementCard } from '@/components/mod-management-card';
import { FeedRoleInfo } from '@/lib/types/user';
import { getModeratorsByFeeds } from '@/repos/permission';
import { TabGroup, TabPanel } from '@/components/tab/tab';
import { getProfile } from '@/repos/profile';

export default async function Page() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <section className='flex flex-col items-center h-full p-4 space-y-8'>
        <h2 className='text-2xl font-bold'>Moderator Management</h2>
        <p>Error: Unable to load profile. Please log in.</p>
      </section>
    );
  }

  const adminFeeds = Object.entries(profile.rolesByFeed || {})
    .filter(([, roleInfo]) => (roleInfo as FeedRoleInfo).type === 'admin')
    .map(([uri, roleInfo]) => ({
      uri,
      displayName: (roleInfo as FeedRoleInfo).displayName || 'Unnamed Feed',
    }));

  const moderatorsByFeed = await getModeratorsByFeeds(adminFeeds);

  const tabs = moderatorsByFeed.map(({ feed, moderators }) => ({
    title: (feed.displayName as string) || '',
    TabContent: (
      <div className='mt-6'>
        <ModManagementCard
          moderators={moderators}
          feed={feed}
          currentUserDid={profile.did}
        />
      </div>
    ),
  }));

  const tabHeaders = tabs.map((tab) => tab.title);

  return (
    <section className='flex flex-col items-center h-full p-4 w-full'>
      <header className='p-4'>
        <h2 className='text-2xl font-bold'>Moderator Management</h2>
      </header>
      <TabGroup data={tabHeaders}>
        {tabHeaders.map((_, index) => (
          <TabPanel key={`feed-${index}`}>
            <ModManagementCard
              moderators={moderatorsByFeed[index].moderators}
              feed={moderatorsByFeed[index].feed}
              currentUserDid={profile.did}
            />
          </TabPanel>
        ))}
      </TabGroup>
    </section>
  );
}
