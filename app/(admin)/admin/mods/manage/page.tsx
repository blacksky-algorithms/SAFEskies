import { getUserProfile } from '@/repos/profile';
import { SupabaseInstance } from '@/repos/supabase';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { ManageModerators } from '@/components/manage-moderators';
import { FeedRoleInfo } from '@/types/user';
import { Tabs } from '@/components/tab/tab';
import Link from 'next/link';

export default async function Page() {
  const profile = await getUserProfile();

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
      displayName: (roleInfo as FeedRoleInfo).displayName,
    }));

  const moderatorsByFeed = await Promise.all(
    adminFeeds.map(async (feed) => {
      const { data } = await SupabaseInstance.from('feed_permissions')
        .select('user_did, role')
        .eq('feed_uri', feed.uri)
        .eq('role', 'mod');

      const moderatorsWithDetails = await Promise.all(
        (data || []).map(async (mod) => {
          try {
            const response = await AtprotoAgent.app.bsky.actor.getProfile({
              actor: mod.user_did,
            });

            return {
              role: mod.role,
              ...response.data,
            };
          } catch {
            return { did: mod.user_did, role: mod.role, handle: mod.user_did };
          }
        })
      );

      return { feed, moderators: moderatorsWithDetails };
    })
  );

  const tabs = moderatorsByFeed.map(({ feed, moderators }) => {
    return {
      title: feed.displayName,
      TabContent: (
        <span>
          {moderators.length > 0 ? (
            <div className='mt-6'>
              <ManageModerators moderators={moderators} feed={feed} />
            </div>
          ) : (
            <span className='flex flex-col items-center space-y-4 p-6 bg-app-secondary-light rounded-md border border-app-border max-w-2xl mx-auto mt-6'>
              <p className='text-app-secondary text-sm'>
                No Moderators Assigned
              </p>
              <Link
                href={`/admin/mods/promote`}
                className='text-app-primary font-semibold hover:underline'
              >
                Promote User to Moderator
              </Link>
            </span>
          )}
        </span>
      ),
    };
  });
  return (
    <section className='flex flex-col items-center h-full p-4  w-full'>
      <header className='p-4'>
        <h2 className='text-2xl font-bold'>Moderator Management</h2>
      </header>
      <Tabs tabs={tabs} />
    </section>
  );
}
