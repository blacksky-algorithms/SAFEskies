import { ProfileManager } from '@/services/profile-manager';
import { ModManagementCard } from '@/components/mod-management-card';
import { FeedRoleInfo } from '@/lib/types/user';
import { Tabs } from '@/components/tab/tab';
import { getModeratorsByFeeds } from '@/repos/permission';

export default async function Page() {
  const profile = await ProfileManager.getProfile();

  if (!profile) {
    return (
      <section className='flex flex-col items-center h-full p-4 space-y-8'>
        <h2 className='text-2xl font-bold'>Moderator Management</h2>
        <p>Error: Unable to load profile. Please log in.</p>
      </section>
    );
  }

  const adminFeeds = Object.entries(profile.rolesByFeed || {})
    .filter(([, roleInfo]) => (roleInfo as FeedRoleInfo).role === 'admin')
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

  return (
    <section className='flex flex-col items-center h-full p-4 w-full'>
      <header className='p-4'>
        <h2 className='text-2xl font-bold'>Moderator Management</h2>
      </header>
      {tabs.length > 0 ? (
        <Tabs tabs={tabs} />
      ) : (
        <p className='text-app-secondary mt-6'>
          You don&apos;t have admin access to any feeds.
        </p>
      )}
    </section>
  );
}
