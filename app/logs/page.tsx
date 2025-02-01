import { Logs } from '@/components/logs';
import { getProfile } from '@/repos/profile';

export default async function Page() {
  const user = await getProfile();
  if (!user) {
    return null;
  }

  return <Logs user={user} />;
}
