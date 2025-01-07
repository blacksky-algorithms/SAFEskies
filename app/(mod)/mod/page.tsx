import { getProfile } from '@/repos/profile';

export default async function Page() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  return (
    <section className='flex flex-col items-center justify-center h-full p-4 space-y-4'>
      <h2>Welcome to Mod {profile.displayName || profile.handle}!</h2>
      <h3>Mod home page??</h3>
    </section>
  );
}
