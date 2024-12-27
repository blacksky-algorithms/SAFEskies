import { PromoteModForm } from '@/components/promote-mod-form';
import { getActorFeeds } from '@/repos/actor';
import { getUserProfile } from '@/repos/user';

export default async function Page() {
  const profile = await getUserProfile();
  const feedsResponse = await getActorFeeds(profile.did);
  const feeds = feedsResponse?.feeds || [];

  return (
    <section className='flex flex-col items-center h-full p-4 space-y-8'>
      <h2 className='text-2xl font-bold'>Promote User</h2>

      <div className='w-full tablet:px-10 space-y-8 flex items-center'>
        <PromoteModForm feeds={feeds} />
      </div>
    </section>
  );
}
