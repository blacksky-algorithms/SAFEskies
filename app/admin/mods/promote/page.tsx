import { PromoteModForm } from '@/components/promote-mod-form';
import { getAdminUserFeeds } from '@/lib/utils/feeds';
import { getProfile } from '@/repos/profile';

export default async function Page() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  const usersAdminFeeds = getAdminUserFeeds(profile?.rolesByFeed);

  return (
    <section className='flex flex-col items-center h-full p-4 space-y-8'>
      <h2 className='text-2xl font-bold'>Promote User</h2>

      <div className='w-full tablet:px-10 space-y-8 flex items-center'>
        <PromoteModForm feeds={usersAdminFeeds} currentUserDid={profile.did} />
      </div>
    </section>
  );
}
