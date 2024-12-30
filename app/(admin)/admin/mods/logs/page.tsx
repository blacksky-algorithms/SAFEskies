import { ProfileManager } from '@/services/profile-manager';

import { ModerationLogViewer } from '@/components/mod-logs';

export default async function Page({
  searchParams,
}: {
  searchParams: { modDID: string; feedUri: string };
}) {
  const { modDID, feedUri } = await searchParams;

  const mod = await ProfileManager.getProfileDetails(modDID);

  return <ModerationLogViewer feedUri={feedUri} mod={mod} />;
}
