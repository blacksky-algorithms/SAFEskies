import { ModLogs } from '@/components/mod-logs';
import { getProfile } from '@/repos/profile';

export default async function Page() {
  const user = await getProfile();
  return <ModLogs user={user} />;
}
