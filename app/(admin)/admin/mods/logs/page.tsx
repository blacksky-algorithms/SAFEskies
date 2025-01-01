import { ProfileManager } from '@/services/profile-manager';
import { ModeratorLogs } from '@/components/moderator-logs';

interface SearchParams {
  modDID?: string;
  feedUri?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function Page({ searchParams }: PageProps) {
  const { modDID, feedUri } = searchParams;

  if (!modDID || !feedUri) {
    return <div>Missing required parameters</div>;
  }

  const mod = await ProfileManager.getProfileDetails(modDID);

  return <ModeratorLogs feedUri={feedUri} targetedProfile={mod} />;
}
