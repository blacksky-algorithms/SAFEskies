import { AdminLogs } from '@/components/admin-logs';
import { getProfile } from '@/repos/profile';

export default async function Page() {
  const user = await getProfile();
  return <AdminLogs user={user} />;
}
