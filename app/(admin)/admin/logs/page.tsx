import { AdminLogs } from '@/components/admin-logs';
import { getProfile } from '@/repos/profile';

export default async function Page() {
  const user = await getProfile();
  if (!user) {
    return null;
  }
  return <AdminLogs user={user} />;
}
