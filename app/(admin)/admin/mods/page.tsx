import { PromoteModForm } from '@/components/promote-mod-form';
import { getActorFeeds } from '@/repos/actor';
import { getUserProfile } from '@/repos/user';

export default async function Page() {
  const profile = await getUserProfile();
  const feedsResponse = await getActorFeeds(profile.did);
  const feeds = feedsResponse?.feeds || [];

  return (
    <section className='flex flex-col items-center justify-center h-full p-4 space-y-8'>
      <h2 className='text-2xl font-bold'>Moderator Management</h2>
      <p>Welcome to Admin Mod Management {profile.name}!</p>
      <p>Role: {profile.role}</p>

      <div className='w-full max-w-2xl space-y-8'>
        <div className='space-y-4'>
          <h3 className='text-xl'>Add New Moderator</h3>
          <PromoteModForm feeds={feeds} />
        </div>

        {/* We'll implement this view in the next phase */}
        <div className='space-y-4'>
          <h3 className='text-xl'>Current Moderators</h3>
          {/* ModeratorList component will go here */}
        </div>
      </div>
    </section>
  );
}
