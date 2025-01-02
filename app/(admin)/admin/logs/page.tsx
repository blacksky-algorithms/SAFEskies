import { AdminLogs } from '@/components/admin-logs';
import { ProfileManager } from '@/services/profile-manager';

export default async function Page() {
  const user = await ProfileManager.getProfile();
  return <AdminLogs user={user} />;
}
