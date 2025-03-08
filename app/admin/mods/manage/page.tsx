import { ModManagementCard } from '@/components/mod-management-card/mod-management-card';
import { TabGroup, TabPanel } from '@/components/tab/tab';
import { getProfile } from '@/repos/profile';
import { fetchModsByFeed } from '@/repos/permission';

export default async function Page() {
  // Fetch the logged-in user's profile (this may come from cookies, etc.)
  const profile = await getProfile();

  if (!profile) {
    return (
      <section className='flex flex-col items-center h-full p-4 space-y-8'>
        <h2 className='text-2xl font-bold'>Moderator Management</h2>
        <p>Error: Unable to load profile. Please log in.</p>
      </section>
    );
  }

  const moderatorsByFeed = await Promise.all(
    profile.rolesByFeed.map(async ({ uri, displayName }) => {
      return await fetchModsByFeed(uri, displayName);
    })
  );

  const tabs = moderatorsByFeed.map(({ feed, moderators }) => ({
    title: feed.displayName,
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
      <TabGroup data={tabHeaders} onlyMobile={false}>
        {tabs.map((tab, index) => (
          <TabPanel key={`feed-${index}`}>{tab.TabContent}</TabPanel>
        ))}
      </TabGroup>
    </section>
  );
}
