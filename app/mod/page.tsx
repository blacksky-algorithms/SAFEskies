import { AuthenticatedFeedGen } from '@/components/authenticated-feed-gen';
import { getUserProfile } from '@/repos/user';

export default async function Page() {
  const profile = await getUserProfile();

  return (
    <section className='flex flex-col items-center justify-center h-full'>
      <span>Welcome {profile.name}!</span>
      <AuthenticatedFeedGen actorUri={profile.did} />
    </section>
  );
}
