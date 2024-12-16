import { AuthenticatedFeedGen } from '@/components/authenticated-feed-gen';
import { getUserProfile } from '@/repos/user';

export default async function Page() {
  const profile = await getUserProfile();

  return (
    <section className='flex flex-col items-center justify-center h-full p-4 space-y-4'>
      <h2>Welcome to Mod {profile.name}!</h2>
      <h3>Role: {profile.role}</h3>
      <p className='text-app-success'>
        Heads up! This page takes a bit to load and buttons will be interactive
        until it does, next pr will fix these issues, this one focuses on auth
        alone
      </p>
      <AuthenticatedFeedGen actorUri={profile.did} />
    </section>
  );
}
