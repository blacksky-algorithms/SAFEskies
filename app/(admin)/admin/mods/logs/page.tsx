import { ModeratorLogs } from '@/components/moderator-logs';
import { getProfileDetails } from '@/repos/profile';

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

  const mod = await getProfileDetails(modDID);

  return <ModeratorLogs feedUri={feedUri} targetedProfile={mod} />;
}
