import { UserManagementPanel } from '@/components/user-management-panel';
import { getProfile } from '@/repos/profile';
import { hasBlackskyPermission } from '@/lib/utils/getLinks';

export default async function Page() {
  // Fetch the logged-in user's profile (this may come from cookies, etc.)
  const profile = await getProfile();

  if (!profile) {
    return (
      <section className='flex flex-col items-center h-full p-4 space-y-8'>
        <h2 className='text-2xl font-bold'>User Management</h2>
        <p>Error: Unable to load profile. Please log in.</p>
      </section>
    );
  }

  // Check if user has proper permissions for Blacksky feed
  if (!hasBlackskyPermission(profile)) {
    return (
      <section className='flex flex-col items-center h-full p-4 space-y-8'>
        <h2 className='text-2xl font-bold'>User Management</h2>
        <p>You do not have access to manage users for any feeds.</p>
      </section>
    );
  }

  return (
    <section className='flex flex-col items-center h-full p-4 w-full'>
      <UserManagementPanel />
    </section>
  );
}