import { ProfileManager } from '@/services/profile-manager';
import { ModeratorLogs } from '@/components/moderator-logs';

interface SearchParams {
  modDID?: string;
  feedUri?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const { modDID, feedUri } = searchParams;

  if (!modDID || !feedUri) {
    return <div>Missing required parameters</div>;
  }

  const mod = await ProfileManager.getProfileDetails(modDID);

  return <ModeratorLogs feedUri={feedUri} targetedProfile={mod} />;
}
