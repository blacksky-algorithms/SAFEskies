import { ProfileManager } from '@/services/profile-manager';

import { ModeratorLogs } from '@/components/moderator-logs';

export default async function Page({
  searchParams,
}: {
  searchParams: { modDID: string; feedUri: string };
}) {
  const { modDID, feedUri } = searchParams;

  const mod = await ProfileManager.getProfileDetails(modDID);

  return <ModeratorLogs feedUri={feedUri} targetedProfile={mod} />;
}
